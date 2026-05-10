/**
 * src/api/client.ts
 * Secure frontend API client — ALL AI calls go through this layer ONLY.
 * No direct AI SDK usage. No browser-side AI execution.
 */

const API_BASE = "/api";

// ---------------------------------------------------------------------------
// Composition Blueprint
// ---------------------------------------------------------------------------

export async function generateCompositionBlueprintViaLLM(
  prefs: any,
  exerciseDatabaseSummary: string,
) {
  const response = await fetch(`${API_BASE}/generate-composition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefs, exerciseDatabaseSummary }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || "Composition generation failed");
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Routine Script
// ---------------------------------------------------------------------------

export async function generateRoutineScript(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  const response = await fetch(`${API_BASE}/generate-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exercises, goal, creatorMode, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || "Script generation failed");
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// AI Video Generation
// ---------------------------------------------------------------------------

export async function generateAIVideo(prompt: string) {
  const response = await fetch(`${API_BASE}/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || "Video generation failed");
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------

export async function generateSEOMetadata(
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: any,
) {
  const response = await fetch(`${API_BASE}/generate-seo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exercises, goal, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || "SEO metadata generation failed");
  }

  return response.json();
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
  const response = await fetch(`${API_BASE}/generate-social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exercises, goal, creatorMode, context }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.details || "Social captions generation failed");
  }

  return response.json();
}
