import Groq from "groq-sdk";

export function validateGroqEnvironment(apiKey: string) {
  if (!apiKey) {
    throw new Error("[AI] API key is missing. Skipping LLM generation.");
  }
}

export async function generateCompositionBlueprintViaLLM(
  apiKey: string,
  prefs: any,
  exerciseDatabaseSummary: string,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);

  const groqOptions: any = { apiKey };
  if (baseURL) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

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

    Output strictly an array of JSON objects representing candidate composition blueprints.
    Each candidate MUST follow this structure:
    [{
      "title": "string",
      "hook": "string",
      "pacingArc": "steady" | "build-up" | "intervals" | "cool-down" | "waves",
      "soundtrackProfile": "cinematic" | "upbeat" | "ambient" | "lofi" | "heavy",
      "transitionRhythm": "fast" | "medium" | "slow" | "mixed",
      "subtitleCadence": "rapid" | "standard" | "relaxed",
      "reasoning": "string",
      "scenes": [
        {
          "exerciseId": "string (MUST perfectly match one of the explicit exercise IDs in the catalog)",
          "duration": "number",
          "script": "string",
          "cameraBehavior": "static" | "slow-zoom" | "pan" | "dynamic",
          "energyLevel": "low" | "medium" | "high" | "peak"
        }
      ]
    }]

    Output strictly as JSON array.
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a fitness routine architect. Output exactly JSON, no markdown, no conversational text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const text = chatCompletion.choices[0]?.message?.content || "[]";
  console.log("LLM RAW OUTPUT:", text);

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    console.error("LLM PARSE ERROR:", e);
    return [];
  }
}

export async function generateRoutineScript(
  apiKey: string,
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);
  
  const groqOptions: any = { apiKey };
  if (baseURL) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Create a professional fitness voiceover script for a ${context?.intensity || "standard"} intensity ${goal} workout routine.

    Exercises:
    ${exercises
      .map((ex, i) => `${i + 1}. ${ex.name} (${ex.duration}s)`)
      .join("\n")}

    Return ONLY raw JSON.
    Do not use markdown.
    Return an array of:
    { "exerciseName": "string", "script": "string" }
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a fitness scriptwriter. Output exactly JSON, no markdown, no conversational text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2000,
  });

  const text = chatCompletion.choices[0]?.message?.content || "[]";

  try {
    const parsed = JSON.parse(text);

    const normalized = Array.isArray(parsed)
      ? parsed
      : [parsed];

    return normalized;
  } catch (e) {
    console.error("[GROQ JSON PARSE FAILED]");
    console.error(e);
    return [];
  }
}

export async function classifyWorkoutIntentViaLLM(
  apiKey: string,
  promptText: string,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);

  const groqOptions: any = { apiKey };
  if (baseURL) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    You are an expert fitness AI assistant. 
    Analyze the following user prompt and classify their workout intent into a structured JSON payload.
    
    User prompt: "${promptText}"

    Output strict JSON matching exactly this structure:
    {
      "durationMinutes": number (default 30 if unstated),
      "focus": string (e.g. "Full Body", "Lower Back", "Neck", "Hips", "Core", "Legs"),
      "level": "Beginner" | "Intermediate" | "Expert" (default Beginner),
      "intensity": "Low" | "Medium" | "High" (default Low if stretching/recovery, else Medium),
      "painPoints": string[] (e.g. ["Lower Back Pain", "Neck Pain,Desk Posture", "Tight Hips"]),
      "equipment": string[] (e.g. ["None", "Mat", "Dumbbell"]),
      "coachingStyle": "Encouraging" | "Direct" | "Intense",
      "goal": string (e.g. "Mobility", "Strength", "Recovery")
    }

    Return ONLY raw JSON. No markdown formatting.
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an AI that converts natural language workout requests into strict structured JSON. Return exactly JSON, no markdown.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("LLM INTENT PARSE ERROR:", e);
    return null;
  }
}

export async function generateAIVideo(prompt: string) {
  console.log("[AI] Video generation not available - using placeholder");

  return {
    status: "placeholder",
    message: "Video generation requires alternative service",
    prompt,
  };
}

export async function generateSEOMetadata(
  apiKey: string,
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: any,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);
  
  const groqOptions: any = { apiKey };
  if (baseURL) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Generate SEO metadata for a fitness workout video.

    Goal: ${goal}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON with: title, description, keywords, ogImage suggestion.
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Output exactly JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function generateSocialCaptions(
  apiKey: string,
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);
  
  const groqOptions: any = { apiKey };
  if (baseURL) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Generate social media captions for a short-form fitness workout video.

    Goal: ${goal}
    Creator Mode: ${creatorMode || "standard"}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON with: caption, hashtags, hooks.
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a social media manager. Output exactly JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

