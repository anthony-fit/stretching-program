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

export async function onRequestGet(context: any) {
  try {
    const db = await getFreeExerciseDB();

    const list = (db || []).map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      level: ex.level,
      primaryMuscles: ex.primaryMuscles || [],
      equipment: ex.equipment,
      imageUrls: (ex.images || []).map((img: string) =>
        `/api/proxy-gif?url=${encodeURIComponent(
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
        )}&name=${encodeURIComponent(ex.name)}`
      ),
    }));

    return jsonResponse(list);
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to fetch exercise database", 500);
  }
}
