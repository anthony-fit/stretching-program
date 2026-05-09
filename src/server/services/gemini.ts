import { GoogleGenAI, Modality } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function assertGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "[AI] GEMINI_API_KEY environment variable is required",
    );
  }

  return apiKey;
}

export function getAI() {
  if (!genAI) {
    const apiKey = assertGeminiKey();

    genAI = new GoogleGenAI({ apiKey });

    console.log("[AI] Gemini singleton initialized");
  }

  return genAI;
}

export function validateGeminiEnvironment() {
  assertGeminiKey();

  console.log("[AI] GEMINI_API_KEY validation passed");
}

function buildWavHeader(pcmLength: number) {
  const wavBytes = new Uint8Array(44 + pcmLength);
  const view = new DataView(wavBytes.buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcmLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 24000 * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, pcmLength, true);

  return wavBytes;
}

export function injectWavHeader(base64Audio: string) {
  const binaryBuffer = Buffer.from(base64Audio, "base64");
  const pcmLength = binaryBuffer.length;

  const wavBytes = buildWavHeader(pcmLength);

  for (let i = 0; i < pcmLength; i++) {
    wavBytes[44 + i] = binaryBuffer[i];
  }

  return Buffer.from(wavBytes).toString("base64");
}

export async function generateCompositionBlueprintViaLLM(
  prefs: any,
  exerciseDatabaseSummary: string,
) {
  const ai = getAI();

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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text || "{}");

  return parsed.candidates || [parsed];
}

export async function generateRoutineScript(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  const ai = getAI();

  const prompt = `
    Create a professional fitness voiceover script for a ${context?.intensity || "standard"} intensity ${goal} workout routine.

    Exercises:
    ${exercises
      .map((ex, i) => `${i + 1}. ${ex.name} (${ex.duration}s)`)
      .join("\n")}

    Format the output as a JSON array.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function generateVoiceover(text: string) {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [
      {
        parts: [
          {
            text: `Say with a professional and motivating fitness coach voice: ${text}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore",
          },
        },
      },
    },
  });

  const inlineData =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

  if (!inlineData?.data) {
    throw new Error("[AI] No audio data returned from Gemini TTS");
  }

  const mimeType = inlineData.mimeType || "audio/wav";

  if (
    inlineData.data.startsWith("UklGRg") ||
    inlineData.data.startsWith("//NExAAAA")
  ) {
    return `data:${mimeType};base64,${inlineData.data}`;
  }

  const wavAudio = injectWavHeader(inlineData.data);

  return `data:audio/wav;base64,${wavAudio}`;
}

export async function generateAIVideo(prompt: string) {
  const ai = getAI();

  const operation = await ai.models.generateVideos({
    model: "veo-3.1-lite-generate-preview",
    prompt: `Professional high-quality fitness video: ${prompt}. High resolution, 4k, clean studio lighting, focused on exercise form.`,
    config: {
      numberOfVideos: 1,
      resolution: "1080p",
      aspectRatio: "9:16",
    },
  });

  return operation;
}

export async function generateSEOMetadata(
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: any,
) {
  const ai = getAI();

  const prompt = `
    Generate SEO metadata for a fitness workout video.

    Goal: ${goal}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateSocialCaptions(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: any,
) {
  const ai = getAI();

  const prompt = `
    Generate social media captions for a short-form fitness workout video.

    Goal: ${goal}
    Creator Mode: ${creatorMode || "standard"}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}

    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
