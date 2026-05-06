import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

app.get("/api/get-stretch", async (req, res) => {
  const searchQuery = req.query.name;

  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
        }
      }
    );

    let data = await response.json();

    // Fallback if no results - try first keyword only
    if (!data || data.length === 0) {
      const fallbackQuery = searchQuery.split(" ")[0];

      const fallbackRes = await fetch(
        `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(fallbackQuery)}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
          }
        }
      );

      data = await fallbackRes.json();
    }

    const simplified = Array.isArray(data) ? data.map(ex => ({
      name: ex.name,
      gifUrl: ex.gifUrl,
      target: ex.target,
      bodyPart: ex.bodyPart
    }));

    res.json(simplified);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to fetch exercise data" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`? Proxy running on http://localhost:${PORT}`)
);
