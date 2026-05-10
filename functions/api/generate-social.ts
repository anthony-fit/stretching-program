import { generateSocialCaptions } from "../../src/server/services/groq";
import { jsonResponse, errorResponse } from "../utils/json";

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { exercises, goal, creatorMode, context: reqContext } = body;

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse("GROQ_API_KEY is not configured", 500);
    }

    const result = await generateSocialCaptions(
      apiKey,
      exercises,
      goal,
      creatorMode,
      reqContext
    );

    return jsonResponse(result);
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to generate social captions",
      500
    );
  }
}