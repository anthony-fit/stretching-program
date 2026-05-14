import { generateMealPlanViaLLM } from '../../src/server/services/groq';
import { jsonResponse, errorResponse } from '../utils/json';

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

export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return errorResponse("Invalid JSON payload", 400);
    }
    
    const { context: mealContext } = payload;
    
    if (!mealContext) {
      console.warn("[AI ROUTE] generate-meal: Missing context in request body");
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse("GROQ API Key missing", 500);
    }

    const result = await generateMealPlanViaLLM(
      apiKey,
      mealContext,
      env.GROQ_BASE_URL || env.GROQ_API_URL
    );

    return jsonResponse(result);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-meal failed", error);
    
    return jsonResponse({
      error: "Failed to generate meal plan",
      details: error?.message || "Unknown error",
    }, 500);
  }
}
