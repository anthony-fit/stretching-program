import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import aiRoutes from "./src/server/routes/ai";
import { validateGroqEnvironment } from "./src/server/services/groq";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure cache directory exists
const CACHE_DIR = path.join(process.cwd(), "gif-cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
  });

  // Validate Groq environment before handling requests
  validateGroqEnvironment();

  // AI API routes
  app.use("/api", aiRoutes);

  // Local GIF Proxy & Cache
  app.get("/api/proxy-gif", async (req, res) => {
    const url = req.query.url as string;
    const name = req.query.name as string;

    if (!url) return res.status(400).send("No URL provided");

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch source image: " + response.statusText);

      const buffer = await response.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);

      const contentType = response.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
      res.send(nodeBuffer);
    } catch (error) {
      console.error("GIF Cache Error:", error);

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "no-cache");
      // Provide a nice fallback animated pulse or text
      res.send(`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1ece5" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#7d7c75">Animation Unavailable</text>
        <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#a4a29a">External server is currently down</text>
      </svg>`);
    }
  });

  let freeExerciseDB: any[] | null = null;
  const getFreeExerciseDB = async () => {
      if (freeExerciseDB && freeExerciseDB.length > 0) return freeExerciseDB;
      try {
          console.log("[API init] Downloading free-exercise-db...");
          // Try main branch first
          let res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json");
          if (!res.ok) {
            // Fallback to master if main fails
            res = await fetch("https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/dist/exercises.json");
          }

          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

          freeExerciseDB = await res.json();
          console.log(`[API init] Loaded ${freeExerciseDB?.length} exercises.`);
      } catch (e) {
          console.error("Failed to load free-exercise-db", e);
          freeExerciseDB = [];
      }
      return freeExerciseDB;
  };

  const apiCache = new Map<string, { data: any; expiry: number }>();
  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours for API results

  app.get("/api/get-stretch", async (req, res) => {
    let searchQuery = (req.query.name as string)?.toLowerCase();

    if (!searchQuery) return res.status(400).json({ error: "Missing name" });

    searchQuery = searchQuery.replace(/[^a-z0-9]+/g, " ").replace(/\b(s)\b/g, "").replace(/\s+/g, " ").trim();

    if (apiCache.has(searchQuery) && apiCache.get(searchQuery)!.expiry > Date.now()) {
      return res.json(apiCache.get(searchQuery)!.data);
    }

    const synonymMap: Record<string, string[]> = {
      "butt bridge": ["glute bridge", "bridge", "hip lift", "butt", "glute"],
      "butt lift bridge": ["glute bridge", "bridge", "hip lift", "butt", "glute"],
      "cat cow": ["cat stretch", "spinal stretch", "cat"],
      "childs pose": ["child's pose", "childs", "child"],
      "hamstring stretch": ["hamstring stretch", "hamstring"],
      "cobra stretch": ["lower back curl", "spinal stretch", "looking at ceiling", "pelvic tilt into bridge", "cobra"],
      "pigeon pose": ["lying glute", "seated glute", "piriformis", "pigeon"],
      "standing forward fold": ["standing toe touches", "toe touchers", "forward fold", "fold"],
      "forward fold": ["standing toe touches", "toe touchers", "forward fold", "fold"],
      "butterfly pose": ["adductor", "lying bent leg groin", "adductor/groin", "intermediate groin stretch", "butterfly", "groin"],
      "downward facing dog": ["pyramid", "butt ups", "runner's stretch", "downward facing balance", "downward dog"],
      "downward dog": ["pyramid", "butt ups", "runner's stretch", "downward facing balance", "downward dog"],
      "gentle neck release": ["side neck stretch", "chin to chest stretch", "neck-smr", "neck"],
      "neck stretch": ["side neck stretch", "chin to chest stretch", "neck-smr", "neck"],
      "cross body shoulder stretch": ["shoulder stretch", "round the world shoulder stretch", "cross body"],
      "shoulder stretch": ["shoulder stretch", "round the world shoulder stretch", "cross body"],
      "hip flexor": ["kneeling hip flexor", "standing hip flexors", "hip stretch", "psoas"],
      "quad stretch": ["all fours quad stretch", "quad stretch", "quadriceps", "thigh stretch", "quad"],
      "chest stretch": ["chest stretch on stability ball", "dynamic chest stretch", "chest and front of shoulder stretch", "chest opener"],
    };

    const searchVariations = Array.from(new Set([
      searchQuery,
      ...(synonymMap[searchQuery] || []),
      searchQuery.split(' ')[0]
    ])).filter(t => t && t.length >= 2);

    try {
      const db = await getFreeExerciseDB();
      let data: any[] = [];

      for (const term of searchVariations) {
        console.log(`[API Search] Trying variation: "${term}"`);

        let matches = db!.filter(item => item.name.toLowerCase().includes(term.toLowerCase()));

        // Prioritize "stretching" category or "body only" equipment
        const stretchesBodyOnly = matches.filter(i => i.equipment === "body only" || i.category === "stretching");
        if (stretchesBodyOnly.length > 0) {
           data = stretchesBodyOnly;
           break;
        }

        if (matches.length > 0) {
           data = matches;
           break;
        }
      }

      const processedData = data.slice(0, 10).map((item: any) => {
        // Build absolute image url for free-exercise-db
        const rawImageUrl = item.images && item.images.length > 0 ?
            `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${item.images[0]}` : null;

        const imageUrls = (item.images || []).map((img: string) =>
            `/api/proxy-gif?url=${encodeURIComponent(`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`)}&name=${encodeURIComponent(item.name || searchQuery)}`
        );

        return {
          ...item,
          imageUrls,
          gifUrl: rawImageUrl ? `/api/proxy-gif?url=${encodeURIComponent(rawImageUrl)}&name=${encodeURIComponent(item.name || searchQuery)}` : null
        };
      });

      console.log(`[API Result] Found ${processedData.length} exercises for "${searchQuery}"`);
      apiCache.set(searchQuery, { data: processedData, expiry: Date.now() + CACHE_TTL });
      res.json(processedData);
    } catch (error) {
      console.error("API Flow Error:", error);
      res.status(500).json({ error: "API connection failed" });
    }
  });

  // NEW: Get all exercises for Studio browsing
  app.get(["/api/all-exercises", "/api/get-exercises"], async (req, res) => {
    try {
      const db = await getFreeExerciseDB();
      // Return a lightweight version for the browser selection
      const list = (db || []).map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        level: ex.level,
        primaryMuscles: ex.primaryMuscles || [],
        equipment: ex.equipment,
        imageUrls: (ex.images || []).map((img: string) =>
          `/api/proxy-gif?url=${encodeURIComponent(`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`)}&name=${encodeURIComponent(ex.name)}`
        )
      }));
      res.json(list);
    } catch (error) {
      console.error("[API Error] /api/all-exercises:", error);
      res.status(500).json({ error: "Failed to fetch exercise database" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running - PID: ${process.pid}`);
  });

  server.timeout = 300000;
}

startServer();
