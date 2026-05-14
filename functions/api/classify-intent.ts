import { classifyWorkoutIntentViaLLM } from '../../src/server/services/groq';
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
    const { promptText } = payload;
    
    if (!promptText) {
      return errorResponse("Missing promptText", 400);
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return errorResponse("GROQ API Key missing", 500);
    }

    // Wrap the LLM call in a Promise to attach a timeout
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 8000));
    
    let intentData = await Promise.race([
      classifyWorkoutIntentViaLLM(apiKey, promptText, env.GROQ_API_URL || env.GROQ_BASE_URL),
      timeout
    ]);

    if (!intentData) {
       // Deterministic Fallback if LLM fails or times out
       intentData = fallbackParser(promptText);
    }

    return jsonResponse(intentData);
  } catch (error) {
    console.error("Classify Intent Error:", error);
    // Even on error, we don't want a dead end. Use deterministic fallback.
    const url = new URL(request.url);
    const intentData = fallbackParser(url.searchParams.get("promptText") || "");
    return jsonResponse(intentData);
  }
}

function fallbackParser(prompt: string) {
  const p = prompt.toLowerCase();
  
  let duration = 30;
  if (p.includes("15")) duration = 15;
  if (p.includes("10")) duration = 10;
  if (p.includes("20")) duration = 20;

  let painPoints: string[] = [];
  if (p.includes("neck")) painPoints.push("Neck Pain,Desk Posture");
  if (p.includes("back") || p.includes("lower back")) painPoints.push("Lower Back Pain");
  if (p.includes("hip")) painPoints.push("Tight Hips");

  let focus = "Full Body";
  if (p.includes("leg")) focus = "Legs";
  if (p.includes("core")) focus = "Core";
  if (p.includes("upper")) focus = "Upper Body";
  if (p.includes("back")) focus = "Back";

  let level = "Beginner";
  if (p.includes("intermediate")) level = "Intermediate";
  if (p.includes("advanced") || p.includes("expert")) level = "Expert";

  let goal = "Stretching";
  if (p.includes("mobility")) goal = "Mobility";
  if (p.includes("recovery")) goal = "Stretching";
  if (p.includes("strength")) goal = "Somatic";

  return {
    durationMinutes: duration,
    focus: focus,
    level: level,
    intensity: "Low",
    painPoints: painPoints,
    equipment: ["None"],
    coachingStyle: "Encouraging",
    goal: goal
  };
}
