import Groq from "groq-sdk";

let groq: Groq | null = null;

function assertGroqKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "[AI] GROQ_API_KEY environment variable is required",
    );
  }

  return apiKey;
}

export function getAI() {
  if (!groq) {
    const apiKey = assertGroqKey();

    groq = new Groq({
      apiKey,
    });

    console.log("[AI] Groq singleton initialized");
  }

  return groq;
}

export function validateGroqEnvironment() {
  assertGroqKey();

  console.log("[AI] GROQ_API_KEY validation passed");
}

export async function generateCompositionBlueprintViaLLM(
  prefs: any,
  exerciseDatabaseSummary: string,
) {
  const client = getAI();

  const prompt = `
    You are an expert fitness video director and master composition planner.
    The user has requested a routine.

    Goal/Type: ${prefs.type}
    Duration (minutes): ${prefs.durationMinutes || parseInt(prefs.duration) / 60}
    Level: ${prefs.level}
    Focus: ${prefs.focus}
    Pain Points: ${prefs.painPoints?.join(", ") || "None"}
    Equipment: ${prefs.equipment?.join(", ") || "None"}
    Intensity: ${prefs.intensity}
    Coaching Style: ${prefs.coachingStyle}

    Here is the catalog of available explicit exercises we can map to:
    ${exerciseDatabaseSummary}

    Output strictly as JSON.
  `;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function generateRoutineScript(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  const client = getAI();

  const prompt = `
    Create a professional fitness voiceover script for a ${context?.intensity || "standard"} intensity ${goal} workout routine.

    Exercises:
    ${exercises
      .map((ex, i) => `${i + 1}. ${ex.name} (${ex.duration}s)`)
      .join("\n")}

    Format the output as a JSON array.
  `;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "[]";

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function generateVoiceover(text: string) {
  const client = getAI();

  const prompt = `Convert the following text to natural, professional fitness coach speech. Return ONLY the text to be spoken, with no additional commentary:
${text}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const spokenText = response.choices[0]?.message?.content || text;

  return { text: spokenText, original: text };
}

export async function generateAIVideo(prompt: string) {
  console.log("[AI] Groq video generation not available - using placeholder");

  return {
    status: "placeholder",
    message: "Video generation requires alternative service",
    prompt,
  };
}

export async function generateSEOMetadata(
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: any,
) {
  const client = getAI();

  const prompt = `
    Generate SEO metadata for a fitness workout video.

    Goal: ${goal}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON with: title, description, keywords, ogImage suggestion.
  `;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function generateSocialCaptions(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  const client = getAI();

  const prompt = `
    Generate social media captions for a short-form fitness workout video.

    Goal: ${goal}
    Creator Mode: ${creatorMode || "standard"}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON with: caption, hashtags, hooks.
  `;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
