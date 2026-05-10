import { jsonResponse, errorResponse } from "../utils/json";

const EXERCISE_DB_URLS = [
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json",
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/dist/exercises.json",
];

let cachedDB: any[] | null = null;

async function getFreeExerciseDB(): Promise<any[]> {
  if (cachedDB && cachedDB.length > 0) return cachedDB;
  for (const url of EXERCISE_DB_URLS) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        cachedDB = await res.json() as any[];
        return cachedDB;
      }
    } catch {}
  }
  cachedDB = [];
  return cachedDB;
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

export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    let searchQuery = (url.searchParams.get("name") || "").toLowerCase();

    if (!searchQuery) {
      return errorResponse("Missing name", 400);
    }

    searchQuery = searchQuery
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(s)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const searchVariations = Array.from(new Set([
      searchQuery,
      ...(synonymMap[searchQuery] || []),
      searchQuery.split(" ")[0],
    ])).filter((t) => t && t.length >= 2);

    const db = await getFreeExerciseDB();
    let data: any[] = [];

    for (const term of searchVariations) {
      let matches = db.filter((item: any) =>
        item.name.toLowerCase().includes(term.toLowerCase())
      );
      const stretchesBodyOnly = matches.filter(
        (i: any) => i.equipment === "body only" || i.category === "stretching"
      );
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
      const rawImageUrl =
        item.images && item.images.length > 0
          ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${item.images[0]}`
          : null;

      const imageUrls = (item.images || []).map((img: string) =>
        `/api/proxy-gif?url=${encodeURIComponent(
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
        )}&name=${encodeURIComponent(item.name || searchQuery)}`
      );

      return {
        ...item,
        imageUrls,
        gifUrl: rawImageUrl
          ? `/api/proxy-gif?url=${encodeURIComponent(rawImageUrl)}&name=${encodeURIComponent(item.name || searchQuery)}`
          : null,
      };
    });

    return jsonResponse(processedData);
  } catch (error: any) {
    return errorResponse(error?.message || "API connection failed", 500);
  }
}
