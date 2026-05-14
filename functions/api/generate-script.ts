import { generateRoutineScript } from "../../src/server/services/groq";
import { jsonResponse, errorResponse } from "../utils/json";

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { exercises, goal, creatorMode, context: reqContext } = body;

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse("GROQ_API_KEY is not configured", 500);
    }

    const baseURL = env.GROQ_BASE_URL;

    const result = await generateRoutineScript(
      apiKey,
      exercises,
      goal,
      creatorMode,
      reqContext,
      baseURL
    );

    return jsonResponse(result);
  } catch (error: any) {
    return errorResponse(
      error?.message || "Failed to generate routine script",
      500
    );
  }
}