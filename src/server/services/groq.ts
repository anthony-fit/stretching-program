import Groq from "groq-sdk";

// Prevent empty string or invalid strings from breaking the SDK
if (typeof process !== "undefined" && process.env) {
  if (
    !process.env.GROQ_BASE_URL ||
    process.env.GROQ_BASE_URL === "" ||
    process.env.GROQ_BASE_URL === "undefined" ||
    process.env.GROQ_BASE_URL === "null" ||
    !process.env.GROQ_BASE_URL.startsWith("http")
  ) {
    delete process.env.GROQ_BASE_URL;
  }
}

export function validateGroqEnvironment(apiKey: string) {
  if (!apiKey) {
    throw new Error("[AI] API key is missing. Skipping LLM generation.");
  }
}

// Add timeout wrapper
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Worker timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export async function generateNutritionCoachingViaLLM(
  apiKey: string,
  payload: any,
  baseURL?: string
) {
  validateGroqEnvironment(apiKey);

  if (!payload) {
    console.error("[AI] Payload missing for nutrition coaching");
    return { message: "Keep focusing on your goals.", type: "tip", timestamp: Date.now() };
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const isNutrition = payload?.type === 'nutrition';

  const prompt = isNutrition ? `
    You are an elite sports nutrition coach.
    Provide a hyper-concise (1 sentence) coaching insight.
    
    Context:
    - Calories Remaining: ${payload?.caloriesRemaining || 'Unknown'}
    - Protein Target Met: ${payload?.hasMetProtein || 'Unknown'}
    - Hydration Met: ${payload?.hasMetHydration || 'Unknown'}
    - Net Calories (Consumed - Burned): ${payload?.netCalories || 'Unknown'}
    - Behavioral State: ${payload?.behavioralState || 'Stable'}
    - Behavioral Context: ${payload?.behavioralContext || 'None'}
    - Weekly Rhythm: ${payload?.weeklyRhythm || 'maintenance'}
    - Predictive State: ${payload?.predictiveState || 'stable_growth'}
    - Burnout Pressure: ${payload?.burnoutPressure || 'low'}
    - Stability Window: ${payload?.recoveryStabilityWindow || 'stable'}
    - Autonomous Operating State: ${payload?.autonomousState || 'stabilize'}
    - AROS Routing Bias: ${payload?.routingBias || 'Standard maintenance'}
    - System Load: ${payload?.systemLoad || 0}%
    - Stabilization Priority: ${payload?.stabilizationPriority || 50}
    
    Guidance:
    - If autonomous_state is simplify or recover, or system_load > 70: Reduce complexity aggressively, avoid high-fatigue recipes, emphasize hydration and sleep.
    - If autonomous_state is optimize: Encourage high precision, timing of nutrients around workouts, and elite performance.
    - If autonomous_state is rebuild: Focus on foundational consistency and micro-wins.
    - Tone: ${payload?.autonomousState === 'optimize' ? 'High-Performance' : payload?.autonomousState === 'rebuild' || payload?.autonomousState === 'simplify' ? 'Rehabilitative' : 'Supportive'}
    - Focus on ONE actionable, empowering tip. Do not use generic praise.
    
    Format:
    {
       "message": "sentence",
       "type": "motivation" // or "warning", "tip"
    }
  ` : `
    You are an elite athletic recovery coach.
    Provide a hyper-concise (1 sentence) coaching insight.
    
    Context:
    - Recovery Score: ${payload?.recoveryScore || 'Unknown'}
    - Readiness: ${payload?.readiness || 'Unknown'}
    - Hydration Score: ${payload?.hydrationScore || 'Unknown'}
    - Muscle Tension: ${payload?.muscleTensionScore || 'Unknown'}
    
    Guidance:
    Provide strict, actionable advice to immediately improve their readiness.
    
    Format:
    {
       "message": "sentence",
       "type": "motivation" // or "warning", "tip"
    }
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an elite fitness AI coach. Return pure JSON without formatting. Limit advice to one sentence.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
    12000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(text);
    return {
      message: parsed.message || "Keep pushing forward consistently.",
      type: parsed.type || "tip",
      timestamp: Date.now()
    };
  } catch (e) {
    throw new Error('Failed to parse coaching response');
  }
}

export async function generateCompositionBlueprintViaLLM(
  apiKey: string,
  prefs: any,
  exerciseDatabaseSummary: string,
  baseURL?: string,
) {
  console.log(`[DEBUG groq.ts] /generate-composition called. summary string chars: ${exerciseDatabaseSummary?.length}`);
  validateGroqEnvironment(apiKey);

  if (!prefs) {
    console.error("[AI] Prefs missing for composition generation");
    return [];
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    You are an expert fitness video director and master composition planner.
    The user has requested a routine.

    Goal/Type: ${prefs?.type || 'Standard'}
    Duration (minutes): ${prefs?.durationMinutes || (prefs?.duration ? parseInt(prefs.duration) / 60 : 30)}
    Level: ${prefs?.level || 'Beginner'}
    Focus: ${prefs?.focus || 'Full Body'}
    Pain Points: ${prefs?.painPoints?.join(", ") || "None"}
    Equipment: ${prefs?.equipment?.join(", ") || "None"}
    Intensity: ${prefs?.intensity || 'Low'}
    Coaching Style: ${prefs?.coachingStyle || 'Encouraging'}

    CRITICAL RULES:
    1. The sum of all scene 'duration's MUST perfectly match the Target Total Seconds exactly.
    2. Exercises MUST be realistic for the requested length (e.g. fewer exercises for 1m, more for 30m).
    3. ONLY use exerciseId from the catalog below.

    Here is the catalog of verified exercises (each maps to an animation/movement asset):
    ${exerciseDatabaseSummary}

    Output strictly a JSON object containing an array of candidate composition blueprints.
    The JSON object MUST follow this structure:
    {
      "blueprints": [
        {
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
        }
      ]
    }

    Output strictly as JSON.
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
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
    }),
    45000 // 45s timeout to allow processing 800+ exercise context
  );

  const text = chatCompletion.choices[0]?.message?.content || "[]";
  console.log("LLM RAW OUTPUT:", text);

  try {
    const parsed = JSON.parse(text);

    // Safely extract the wrapped array
    if (parsed.blueprints && Array.isArray(parsed.blueprints)) {
      console.log("[PIPELINE] Wrapped blueprint extracted");
      return parsed.blueprints;
    } else if (Array.isArray(parsed)) {
      console.log("[PIPELINE] Groq blueprint parsed successfully");
      return parsed;
    } else if (
      parsed.data &&
      parsed.data.blueprints &&
      Array.isArray(parsed.data.blueprints)
    ) {
      console.log("[PIPELINE] Wrapped blueprint extracted (data)");
      return parsed.data.blueprints;
    } else {
      throw new Error(
        "[PIPELINE] Invalid Groq blueprint structure - Missing 'blueprints' array",
      );
    }
  } catch (e) {
    console.error("[AI] LLM PARSE ERROR:", e);
    return [];
  }
}

export async function generateRoutineScript(
  apiKey: string,
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  if (!exercises || !Array.isArray(exercises)) {
    console.warn("[AI] No exercises provided for script generation");
    return [];
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Create a professional fitness voiceover script for a ${context?.intensity || "standard"} intensity ${goal || 'Recovery'} workout routine.

    Exercises:
    ${exercises
      .map((ex, i) => `${i + 1}. ${ex.name} (${ex.duration}s)`)
      .join("\n")}

    Return ONLY raw JSON.
    Do not use markdown.
    Return a JSON object containing an array under the "scripts" key:
    {
      "scripts": [
        { "exerciseName": "string", "script": "string" }
      ]
    }
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
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
      response_format: { type: "json_object" },
    }),
    15000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(text);

    if (parsed.scripts && Array.isArray(parsed.scripts)) {
      return parsed.scripts;
    }
    
    // Fallbacks
    if (parsed.data && Array.isArray(parsed.data)) return parsed.data;
    if (Array.isArray(parsed)) return parsed;

    return [];
  } catch (e) {
    console.error("[GROQ JSON PARSE FAILED]");
    console.error(e);
    return [];
  }
}

export async function generateMealPlanViaLLM(
  apiKey: string,
  context: any,
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  if (!context) {
    console.error("[AI] Context missing for meal plan");
    return { meals: [] };
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    You are an expert sports nutritionist and culinary planner.
    Generate a meal plan or recipe based strictly on this context. 
    DO NOT recount calories or macros. Use the data provided.

    Context:
    - Remaining Calories: ${context?.remainingCalories || 'Unknown'} kcal
    - Remaining Protein: ${context?.remainingProtein || 'Unknown'}g
    - Remaining Carbs: ${context?.remainingCarbs || 'Unknown'}g
    - Remaining Fat: ${context?.remainingFat || 'Unknown'}g
    - Recovery State: ${context?.recoveryState || 'Unknown'}
    - Diet Type: ${context?.options?.dietType || 'Any'}
    - Allergies: ${context?.options?.allergies?.join(', ') || 'None'}
    - Preferred Foods: ${context?.options?.preferredFoods?.join(', ') || 'None'}
    - Available Ingredients: ${context?.options?.availableIngredients?.join(', ') || 'None'}
    - Cooking Time Limit: ${context?.options?.cookingTimeTarget || 'Any'} mins
    - Session Intensity: ${context?.options?.sessionIntensity || 'moderate'}
    - Meal Type: ${context?.options?.mealType || 'Any'}

    CRITICAL RULES:
    1. If recovery state is "high_fatigue", prioritize nutrient-dense, easy to digest, higher potassium/magnesium options.
    2. If session intensity was "high", bump hydration and glycogen refill recommendations (if macro space permits).
    3. Return STRICTLY a JSON object without markdown.
    4. Provide exactly 1 or more meal options that total to APPROXIMATELY the remaining macros.

    Output format:
    {
      "meals": [
        {
          "title": "Meal Title",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "prepTime": number,
          "tags": ["string"],
          "ingredients": ["string"],
          "steps": ["string"]
        }
      ]
    }
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an elite sports nutritionist. Output exactly JSON, no markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
    15000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(text);
    if (parsed.data && Array.isArray(parsed.data.meals)) return parsed.data;
    return parsed;
  } catch (e) {
    console.error("[AI] MEAL PLAN PARSE ERROR:", e);
    return { meals: [] };
  }
}

export async function generateMealTimelineViaLLM(
  apiKey: string,
  context: any,
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  if (!context) {
    console.error("[AI] Context missing for meal timeline");
    return { slots: [] };
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    You are an expert sports nutritionist and culinary planner.
    You must populate the empty slots in a deterministic meal timeline.
    Generate ONLY lightweight recipe payloads (ideas, ingredients, preparation steps).
    DO NOT invent nutrition totals or recalculate calories/macros.
    Use the provided deterministic slot targets as guidelines to come up with appropriate meal ideas.

    Context:
    - Recovery State: ${context?.recoveryScore || 'Unknown'}
    - Workout Intensity: ${context?.workoutIntensity || 'Unknown'}
    - Logged/Preferred Foods: ${context?.loggedFoods?.join(', ') || 'None'}
    
    Adaptive Intelligence Mode: ${context?.adaptiveMode || 'balanced'}
    Guideline: ${context?.adaptiveContext || 'Provide balanced, nutrient-dense whole foods.'}
    
    If regenerating (regeneration count > 0), DIVERSIFY the choice significantly from typical preferences.

    Timeline Slots:
    ${JSON.stringify(context.slots, null, 2)}

    CRITICAL RULES:
    1. NEVER invent nutrition totals. Target macros are informational only.
    2. Recipes should APPROXIMATE targets naturally.
    3. Return STRICTLY a JSON object without markdown.
    4. You MUST provide exactly one recipe for each slot category requested.

    Output format:
    {
      "slots": [
        {
          "category": "breakfast",
          "recipe": {
            "title": "Meal Title",
            "ingredients": ["string"],
            "prepSteps": ["string"],
            "tags": ["string"],
            "estimatedPrepTime": "15 mins"
          }
        }
      ]
    }
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an elite sports nutritionist. Output exactly JSON, no markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
    20000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    console.error("[AI] TIMELINE MEAL PLAN PARSE ERROR:", e);
    return { slots: [] };
  }
}

export async function classifyWorkoutIntentViaLLM(
  apiKey: string,
  promptText: string,
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

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

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI that converts natural language workout requests into strict structured JSON. Return exactly JSON, no markdown.",
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
    }),
    12000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("[AI] LLM INTENT PARSE ERROR:", e);
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
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  if (!exercises) {
    return { title: goal || "Workout", description: "Elite fitness routine." };
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Generate SEO metadata for a fitness workout video.

    Goal: ${goal || 'General Fitness'}
    Exercises: ${Array.isArray(exercises) ? exercises.map((ex) => ex?.name).join(", ") : 'Fixed Routine'}

    Return JSON with: title, description, keywords, ogImage suggestion.
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
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
      response_format: { type: "json_object" },
    }),
    12000
  );

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
  baseURL?: string,
) {
  validateGroqEnvironment(apiKey);

  if (!exercises) {
    return { caption: "Check out this new workout!", hashtags: ["fitness", "stretching"], hooks: ["Ready for a change?"] };
  }

  const groqOptions: any = { apiKey };
  if (baseURL && baseURL !== "undefined" && baseURL !== "null" && baseURL.startsWith("http")) groqOptions.baseURL = baseURL;

  const groq = new Groq(groqOptions);

  const prompt = `
    Generate social media captions for a short-form fitness workout video.

    Goal: ${goal || 'Fitness'}
    Creator Mode: ${creatorMode || "standard"}
    Exercises: ${Array.isArray(exercises) ? exercises.map((ex) => ex?.name).join(", ") : 'Various'}

    Return JSON strictly conforming to this object with no markdown:
    { "caption": "string", "hashtags": ["string"], "hooks": ["string"] }
  `;

  const chatCompletion = await withTimeout(
    groq.chat.completions.create({
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
      response_format: { type: "json_object" },
    }),
    12000
  );

  const text = chatCompletion.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
