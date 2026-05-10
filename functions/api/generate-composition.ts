import { generateCompositionBlueprintViaLLM } from "../../src/server/services/groq";
import { jsonResponse, errorResponse } from "../utils/json";

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { prefs, exerciseDatabaseSummary } = body;

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse("GROQ_API_KEY is not configured", 500);
    }

    const result = await generateCompositionBlueprintViaLLM(
      apiKey,
      prefs,
      exerciseDatabaseSummary
    );

    return jsonResponse(result);
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to generate composition blueprint",
      500
    );
  }
}