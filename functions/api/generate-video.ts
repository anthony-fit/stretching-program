import { generateAIVideo } from "../../src/server/services/groq";
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
    const { request } = context;
    const body = await request.json();
    const { prompt } = body;

    const operation = await generateAIVideo(prompt);

    return jsonResponse(operation);
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to generate AI video", 500);
  }
}