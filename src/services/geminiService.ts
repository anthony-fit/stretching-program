import { GoogleGenAI, Type } from "@google/genai";
import { VERIFIED_EXERCISES } from "../constants/exercises";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StretchExercise {
  name: string;
  slug?: string;
  duration: string | number;
  description: string;
  targetArea: string;
  safetyTip: string;
  youtubeVideoId: string;
  backupVideoIds: string[];
  youtubeQuery: string;
  videoSource: string;
  imageUrl?: string | null;
  instruction?: string;
  breathing?: string;
  safety?: string;
}

export interface StretchRoutine {
  title: string;
  focusArea: string;
  level: string;
  duration: number;
  exercises: StretchExercise[];
  motivationalNote: string;
}

console.warn("Gemini service is disabled");

export async function generateStretchRoutine(
  level: string,
  focusArea: string,
  duration: number,
  realExercises: any[] = []
): Promise<StretchRoutine> {
  throw new Error("Gemini is disabled - should not be called");
}
