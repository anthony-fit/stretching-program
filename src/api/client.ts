/**
 * src/api/client.ts
 * Secure frontend API client — ALL AI calls go through this layer ONLY.
 * No direct AI SDK usage. No browser-side AI execution.
 */
import { safeFetch } from '../lib/network/safeFetch';
import { normalizeAIError } from '../lib/errors/normalizeAIError';

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Composition Blueprint
// ---------------------------------------------------------------------------

export async function classifyWorkoutIntent(promptText: string): Promise<any> {
  try {
    return await safeFetch(`${API_BASE}/classify-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptText }),
      timeoutMs: 15000,
      retries: 1,
    });
  } catch (error) {
    const normError = normalizeAIError(error);
    console.warn("Classification failed, using fallback parser. Error was:", normError);
    // Graceful fallback parser in client just in case
    return fallbackParser(promptText);
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

export async function generateCompositionBlueprintViaLLM(
  prefs: any,
  exerciseDatabaseSummary: string,
) {
  console.log("[DEBUG api/client.ts] About to POST /api/generate-composition, chars:", exerciseDatabaseSummary.length);
  try {
    return await safeFetch(`${API_BASE}/generate-composition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefs, exerciseDatabaseSummary }),
      timeoutMs: 45000,
      retries: 1,
    });
  } catch (error) {
    const err = normalizeAIError(error);
    throw new Error(err.message);
  }
}

// ---------------------------------------------------------------------------
// Routine Script
// ---------------------------------------------------------------------------

export async function generateRoutineScript(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
): Promise<{ exerciseName: string; script: string }[]> {
  try {
    return await safeFetch(`${API_BASE}/generate-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises, goal, creatorMode, context }),
      timeoutMs: 20000,
      retries: 1,
    });
  } catch (error) {
    const err = normalizeAIError(error);
    throw new Error(err.message);
  }
}

// ---------------------------------------------------------------------------
// AI Video Generation
// ---------------------------------------------------------------------------

export async function generateAIVideo(prompt: string) {
  try {
    return await safeFetch(`${API_BASE}/generate-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      timeoutMs: 30000,
      retries: 1,
    });
  } catch (error) {
    const err = normalizeAIError(error);
    throw new Error(err.message);
  }
}

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------

export async function generateSEOMetadata(
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: any,
) {
  try {
    return await safeFetch(`${API_BASE}/generate-seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises, goal, context }),
      timeoutMs: 15000,
      retries: 1,
    });
  } catch (error) {
    const err = normalizeAIError(error);
    throw new Error(err.message);
  }
}

// ---------------------------------------------------------------------------
// Social Captions
// ---------------------------------------------------------------------------

export async function generateSocialCaptions(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  try {
    return await safeFetch(`${API_BASE}/generate-social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises, goal, creatorMode, context }),
      timeoutMs: 15000,
      retries: 1,
    });
  } catch (error) {
    const err = normalizeAIError(error);
    throw new Error(err.message);
  }
}
