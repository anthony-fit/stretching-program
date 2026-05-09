import { GoogleGenAI, Modality } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function generateCompositionBlueprintViaLLM(
  prefs: any,
  exerciseDatabaseSummary: string,
) {
  try {
    const ai = getAI();
    const prompt = `
    You are an expert fitness video director and master composition planner.
    The user has requested a routine. 

    Their parameters:
    Goal/Type: ${prefs.type}
    Duration (minutes): ${prefs.durationMinutes || parseInt(prefs.duration) / 60}
    Level: ${prefs.level}
    Focus: ${prefs.focus}
    Pain Points: ${prefs.painPoints?.join(", ") || "None"}
    Equipment: ${prefs.equipment?.join(", ") || "None"}
    Intensity: ${prefs.intensity}
    Coaching Style: ${prefs.coachingStyle}
    
    === LONGITUDINAL SYSTEM MEMORY (TASTE PROFILE) ===
    Preferred Pacing: ${prefs.learnedTaste?.preferredPacing || "editorial_steady"}
    Preferred Subtitle Density: ${prefs.learnedTaste?.preferredSubtitles || "minimal_low_density"}
    Preferred Soundtrack Intensity: ${prefs.learnedTaste?.preferredSoundtrack || "ambient_restrained"}
    Transition Density: ${prefs.learnedTaste?.transitionDensity || "low"}
    Historical System Fatigue: ${prefs.learnedTaste?.historicalFatigue || "fresh"} (If accumulated, rely on calmer scenes)
    =================================================
    
    === NARRATIVE CONTINUITY INTELLIGENCE ===
    Identity Profile: ${prefs.continuity?.identityProfile || "restrained_cinematic"}
    Recovery Debt: ${prefs.continuity?.recoveryDebt || 0}/100
    Recommended Evolution: ${prefs.continuity?.recommendedEvolution || "Maintain baseline."}
    Recent Themes to Evolve From (avoid direct repetition): ${prefs.continuity?.recentMotifs?.join(", ") || "None"}
    =================================================

    === DISTRIBUTION & AUDIENCE INTELLIGENCE ===
    Platform: ${prefs.audienceContext?.platform || "web_app"}
    Environment: ${prefs.audienceContext?.viewingEnvironment || "personal_coaching"} 
    Sound: ${prefs.audienceContext?.soundAvailability || "speakers"}
    Recommended Subtitle Mode: ${prefs.distributionConstraints?.recommendedSubtitleMode || "editorial_cinematic"}
    Hook Style: ${prefs.distributionConstraints?.hookStyle || "movement_curiosity"}
    Max Initial Scene Duration: ${prefs.distributionConstraints?.maxInitialSceneDuration || 15}s
    Allowed Pacing Arcs: ${prefs.distributionConstraints?.allowedPacingArcs?.join(", ") || "Any"}
    *(Do NOT violate the calmness philosophy or established Identity Profile for engagement hacks. Evolve subtly based on environment).*
    =================================================
    
    === AESTHETIC PHILOSOPHY & INTENTIONAL NOVELTY ===
    Aesthetic Philosophy: ${prefs.aestheticPhilosophy || "restrained_cinematic"}
    Intentional Novelty Guidance: ${prefs.intentionalNovelty?.length ? prefs.intentionalNovelty.join(" | ") : "Maintain Identity Coherence."}
    *(This is your creative north star. Ensure internal harmony between subtitle cadence, soundtrack tone, and transition logic).*
    =================================================
    
    === SYMBOLIC LANGUAGE & NARRATIVE MYTHOLOGY ===
    Target Archetype: ${prefs.symbolicState?.targetArchetype || "grounded_discipline"}
    Primary Motif: ${prefs.symbolicState?.primary || "grounded_stillness"}
    Secondary Motif: ${prefs.symbolicState?.secondary || "silent_integration"}
    Symbolic Guidance: ${prefs.symbolicState?.driftWarning || "Avoid motivational cliches. Use felt emotional metaphors."}
    *(Ensure the ending feels emotionally resolved relative to the Target Archetype).*
    =================================================

    === EMERGENT EVOLUTION & CINEMATIC METRICS ===
    System Stability: ${prefs.evolutionState?.stability?.status || "evolving"} (Maturity: ${prefs.evolutionState?.stability?.maturityScore || 50}/100)
    Discovered Emergent Motifs: ${prefs.evolutionState?.emergentMotifs?.map((m: any) => m.description).join(", ") || "None yet"}
    Proposed Micro-Evolutions: ${prefs.evolutionState?.proposedEvolutions?.join(", ") || "Stabilize current identity"}
    *(Do not force evolution if the system is stabilized. If evolving, apply micro-evolutions gently without disrupting structural governance).*
    =================================================

    === COLLECTIVE PATTERN INTELLIGENCE & ETHICAL GUARDRAILS ===
    Fatigue Avoidance Priority: ${prefs.collectiveTendencies?.fatigueAvoidance ? "High (Reduce subtitle saturation and cognitive overload)" : "Normal"}
    Recommended Narrative Density: ${prefs.collectiveTendencies?.narrativeDensityCap || "sparse"}
    Silence Tendency: ${prefs.collectiveTendencies?.recommendedSilenceTendency || "moderate"}
    *(CRITICAL ETHICAL CONSTRAINTS: You are strictly forbidden from optimizing for engagement loops, anxiety escalation, manipulative urgency, parasocial attachment, or emotional overstimulation. Calmness and closure are sacred.)*
    =================================================

    === CONSCIOUS ENVIRONMENTAL PRESENCE & RECIPROCAL CALMNESS ===
    Creator's Current Emotional State: ${prefs.presenceAtmosphere?.editorState || "focused"}
    Workspace Sustainability Score: ${prefs.presenceAtmosphere?.sustainabilityScore || 100}/100
    Reciprocal Needs: ${prefs.presenceAtmosphere?.cinematicReciprocity?.enforceSilenceExtension ? "Extend Silence Intervals. " : ""}${prefs.presenceAtmosphere?.cinematicReciprocity?.suppressPeakEnergy ? "Suppress Peak Energy. " : ""}${prefs.presenceAtmosphere?.cinematicReciprocity?.prioritizeRecovery ? "Prioritize Recovery Archetypes. " : ""}${prefs.presenceAtmosphere?.cinematicReciprocity?.softenNarrativeDensity ? "Soften Narrative Density." : ""}
    *(If the creator's state is fatigued, anxious, or overstimulated, the workspace and generated compositions MUST prioritize calming, spacious, and low-cognitive-load orchestration to reciprocally protect their nervous system.)*
    =================================================

    === RHYTHMIC TEMPORAL INTELLIGENCE & FELT TIME ===
    Felt Elasticity: ${prefs.rhythmState?.feltElasticity || "grounded"}
    Silence Architecture: ${prefs.rhythmState?.silenceStructure || "reflective_recovery_windows"}
    Temporal Atmosphere: ${prefs.rhythmState?.atmosphereField || "release_stabilization"}
    Long-Form Decompression Required: ${prefs.rhythmState?.longFormOscillation?.requiresDecompression ? "Yes - Enforce pacing elasticity and slow narrative breathing." : "No"}
    *(CRITICAL RHYTHM GUIDANCE: Treat time as felt emotional weight. Use silence not as absence, but as structural release. Ensure the pacing feels ${prefs.rhythmState?.feltElasticity || "grounded"} to the nervous system.)*
    =================================================

    === EXISTENTIAL COHERENCE & SYSTEMIC PURPOSE ===
    Meaning Sustainability: ${prefs.purposeState?.resolution?.supportsEmotionalSustainability ? "Stable" : "Drifting (Apply Immediate Course Correction)"}
    Existential Resolution: Must feel psychologically complete and preserve human dignity.
    Foundational Invariants: Calmness > Stimulation. Restoration > Urgency. Spaciousness > Compression.
    *(CRITICAL PURPOSE GUIDANCE: ${prefs.purposeState?.enforceHumaneConstraints ? "The system detects purpose drift or fatigue. You MUST strip away complexity. Return to profound, simple, restorative stillness." : "Maintain deep humane purpose and nervous-system sustainability."})*
    =================================================

    === STILLNESS, RESTRAINT & NON-GENERATION ===
    Restorative Silence State: ${prefs.stillnessState?.recommendation?.restorativeSilenceStateActive ? "Active" : "Inactive"}
    Creative Saturation Component: ${prefs.stillnessState?.saturation?.symbolicIntensityOverload ? "Overloaded" : "Optimal"}
    *(CRITICAL STILLNESS GUIDANCE: If Restorative Silence State is Active, you must embrace extreme restraint. Generate only what is structurally necessary. Honor calm space. Do not fill silence just to create. Remember that non-generation and stillness are valid emotional outcomes. ${prefs.stillnessState?.recommendation?.dignifiedRestraintMessage || ""})*
    =================================================

    Here is the catalog of available explicit exercises we can map to:
    ${exerciseDatabaseSummary}

    You must act as the AUTONOMOUS COMPOSITION INTELLIGENCE and declare full structured timeline blueprints.
    Do NOT manually configure timeline state. You must generate 3 distinct candidate cohesive JSON payloads that outline:
    1. The core structural metadata (title, hook, pacing arc, etc.)
    2. The sequenced ordering of scenes, their durations, how the camera should behave, and what energy level they should be at.
    3. The precise script associated with each scene based on the coaching style.
    
    Ensure the sum of the durations across all scenes equals exactly ${prefs.durationMinutes ? prefs.durationMinutes * 60 : parseInt(prefs.duration)} seconds.
    Select primarily from the catalog. You can piece them together intuitively.
    
    Output strictly as a JSON object matching this schema:
    {
      "candidates": [
        {
          "title": "A strong cinematic title",
          "hook": "A brief engaging hook for the very beginning",
          "pacingArc": "steady" | "build-up" | "intervals" | "cool-down" | "waves",
          "soundtrackProfile": "cinematic" | "upbeat" | "ambient" | "lofi" | "heavy",
          "transitionRhythm": "fast" | "medium" | "slow" | "mixed",
          "subtitleCadence": "rapid" | "standard" | "relaxed",
          "reasoning": "A paragraph explaining why you built it this way.",
          "scenes": [
            {
              "exerciseId": "must map to an ID from the catalog",
              "duration": 15,
              "script": "The narration to be spoken during this scene...",
              "cameraBehavior": "static" | "slow-zoom" | "pan" | "dynamic",
              "energyLevel": "low" | "medium" | "high" | "peak"
            }
          ]
        }
      ] // You MUST generate exactly 3 distinct candidates
    }
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
  } catch (error) {
    console.error("Error generating composition blueprint:", error);
    return null;
  }
}

export async function generateRoutineScript(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: {
    painPoints?: string[];
    coachingStyle?: string;
    intensity?: string;
    reasoning?: string;
    phase?: string;
    readiness?: string;
    momentum?: string;
    coachId?: string;
    userLevel?: string;
    journeyName?: string;
    journeyFocus?: string;
    transformationNarrative?: string;
  },
) {
  let toneInstruction =
    "Keep the tone professional, encouraging, and focused on mobility and longevity.";

  if (
    goal?.toLowerCase().includes("hiit") ||
    goal?.toLowerCase().includes("cardio")
  ) {
    toneInstruction =
      "Keep the tone high-intensity, motivating, and punchy. Focus on heart rate and calorie burn.";
  } else if (goal?.toLowerCase().includes("strength")) {
    toneInstruction =
      "Keep the tone focused, coaching-oriented, and technical. Focus on muscle activation and proper form.";
  } else if (
    goal?.toLowerCase().includes("stretch") ||
    goal?.toLowerCase().includes("mobility")
  ) {
    toneInstruction =
      "Keep the tone restorative, calm, and breath-focused. Focus on range of motion and relaxation.";
  }

  if (creatorMode === "tiktok" || creatorMode === "shorts") {
    toneInstruction +=
      " Also make it native to social media, using active verbs and high-energy hooks.";
  } else if (creatorMode === "wellness") {
    toneInstruction +=
      " Use very gentle, soothing language focused on self-care.";
  }

  let journeyText = "";
  if (context?.journeyName) {
    journeyText = `\n    Current Transformation Journey: ${context.journeyName} (Focus: ${context.journeyFocus}). 
    Transformation Narrative: ${context.transformationNarrative || "Initial phase"}. 
    Reference the user's progress toward their mobility goals and acknowledge their stage in this transformation.`;
  }

  let coachText = "";
  if (context?.coachId) {
    coachText = `\n    Coach Personality ID: ${context.coachId}. Adopt their specific tone and encouragement style.`;
  } else if (context?.coachingStyle) {
    toneInstruction += ` Ensure the coaching style matches: ${context.coachingStyle}.`;
  }

  let levelText = "";
  if (context?.userLevel) {
    levelText = `\n    User Experience Level: ${context.userLevel}. (Beginner = more educational/detailed, Advanced = more concise/performance-focused).`;
  }

  let painPointText = "";
  if (context?.painPoints && context.painPoints.length > 0) {
    painPointText = `\n    The user has these pain points/goals: ${context.painPoints.join(", ")}. Politely and empathetically mention how these exercises help address this safely.`;
  }

  let reasoningText = "";
  if (context?.reasoning) {
    reasoningText = `\n    Strategic Rationale: ${context.reasoning}`;
  }

  let phaseText = "";
  if (context?.phase) {
    phaseText = `\n    Current Program Phase: ${context.phase}. Reference the phase journey and progression goals regularly. Use phrases that indicate "We are in this together".`;
  }

  let readinessText = "";
  if (context?.readiness) {
    readinessText = `\n    User Readiness Score: ${context.readiness} out of 100. Adjust the verbal intensity accordingly to support their current physiological state.`;
  }

  let momentumText = "";
  if (context?.momentum) {
    momentumText = `\n    User Momentum: ${context.momentum}. Acknowledge their consistency and progress journey so far if positive.`;
  }

  const prompt = `
    Create a professional fitness voiceover script for a ${context?.intensity || "standard"} intensity ${goal} workout routine, optimized for ${creatorMode || "standard"} social format.
    
    ${journeyText}
    ${coachText}
    ${levelText}
    ${reasoningText}
    ${phaseText}
    ${readinessText}
    ${momentumText}
    
    The routine consists of:
    ${exercises.map((ex, i) => `${i + 1}. ${ex.name} (${ex.duration}s)`).join("\n")}
    ${painPointText}
    
    For each exercise:
    1. Give a motivating introduction (match the coach identity and goal).
    2. Provide 2-3 clear form cues.
    3. Include a transition reminder to the next move.
    4. Briefly explain WHY this exercise was selected (connect to the session strategy and phase).
    
    DEFENSIVE GUIDELINES:
    - NO toxic fitness culture or "no pain no gain" language.
    - Focus on mobility, joint health, and longevity.
    - Avoid unrealistic transformation claims.
    - Use technical, clinical, yet encouraging coaching cues.
    
    Format the output as a JSON array of objects:
    [{ "exerciseName": string, "script": string }]
    
    ${toneInstruction}
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating script:", error);
    return [];
  }
}

export async function generateVoiceover(text: string) {
  try {
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
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const inlineData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData?.data) {
      const mimeType = inlineData.mimeType || "audio/wav";

      // If it's already audio/wav or audio/mp3, just return it directly!
      // The API often returns proper WAV format now.
      // If it's raw PCM, it won't have a WAV header, but let's check its start.
      // "UklGRg" is "RIFF" in base64.
      if (inlineData.data.startsWith("UklGRg")) {
        console.log("[aiService] Detected WAV header in base64");
        return `data:${mimeType};base64,${inlineData.data}`;
      } else if (inlineData.data.startsWith("//NExAAAA")) {
        // mp3 header ?
        return `data:${mimeType};base64,${inlineData.data}`;
      }

      // If it really is raw PCM, the Web Audio component needs it as a valid Blob or AudioBuffer,
      // but returning raw PCM as 'audio/wav' in an <audio> tag outright fails in browsers.
      // Let's just return the raw payload as mp3/wav and see if browser plays it.
      // Actually, let's wrap it in WAV ONLY IF we confirm it has no header.
      const base64Audio = inlineData.data;
      const binaryString = atob(base64Audio);
      const pcmLen = binaryString.length;

      // Safety check: if the binary starts with RIFF, it's a WAV.
      if (binaryString.substring(0, 4) === "RIFF") {
        return `data:${mimeType};base64,${base64Audio}`;
      }

      const wavBytes = new Uint8Array(44 + pcmLen);
      const view = new DataView(wavBytes.buffer);

      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + pcmLen, true);
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
      view.setUint32(40, pcmLen, true);

      for (let i = 0; i < pcmLen; i++) {
        wavBytes[44 + i] = binaryString.charCodeAt(i);
      }

      // Quickest binary conversion
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < wavBytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(
          null,
          Array.from(wavBytes.subarray(i, i + chunkSize)),
        );
      }

      return `data:audio/wav;base64,${btoa(binary)}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating voiceover:", error);
    return null;
  }
}

export async function generateAIVideo(prompt: string) {
  try {
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
  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
}

export async function generateSEOMetadata(
  exercises: { name: string; duration: number }[],
  goal: string,
  context?: {
    coachName?: string;
    coachSignature?: string;
    journeyName?: string;
    transformationNarrative?: string;
    storyTheme?: string;
  },
) {
  const prompt = `
    Generate SEO metadata for a fitness workout video.
    Goal: ${goal}
    Coach: ${context?.coachName || "Professional Coach"}
    Coach Signature: ${context?.coachSignature || ""}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}
    
    Current Transformation Journey: ${context?.journeyName || "General Wellness"}
    Transformation Narrative: ${context?.transformationNarrative || "Initial phase"}
    Story Theme: ${context?.storyTheme || "General Progress"}
    
    DEFENSIVE GUIDELINES:
    - Avoid repetitive hashtags (max 5-7).
    - No "clickbait" or false promises.
    - Ensure tone is authentic and journey-aware.
    
    Format the output as a JSON object:
    {
      "seoTitle": "Engaging title under 60 chars",
      "metaDescription": "Description under 160 chars",
      "youtubeTitle": "Clickable YouTube title under 100 chars",
      "slug": "seo-friendly-url-slug",
      "hashtags": ["list", "of", "relevant", "hashtags"],
      "keywords": ["list", "of", "seo", "keywords"]
    }
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating SEO metadata:", error);
    return null;
  }
}

export async function generateSocialCaptions(
  exercises: { name: string; duration: number }[],
  goal: string,
  creatorMode?: string,
  context?: {
    coachName?: string;
    coachSignature?: string;
    journeyName?: string;
    transformationNarrative?: string;
    storyTheme?: string;
  },
) {
  const prompt = `
    Generate social media captions for a short-form fitness workout video.
    Goal: ${goal}
    Coach: ${context?.coachName || "Professional Coach"}
    Coach Signature: ${context?.coachSignature || ""}
    Exercises: ${exercises.map((ex) => ex.name).join(", ")}
    Creator Mode: ${creatorMode || "standard"}
    
    Current Transformation Journey: ${context?.journeyName || "General Wellness"}
    Transformation Narrative: ${context?.transformationNarrative || "Initial phase"}
    Story Theme: ${context?.storyTheme || "General Progress"}
    
    DEFENSIVE GUIDELINES:
    - Avoid repetitive hashtags (max 5-7).
    - No "clickbait" or false promises.
    - Ensure tone is authentic and journey-aware.
    
    Format the output as a JSON object:
    {
      "tiktokCaption": "Short, punchy caption for TikTok with native-feeling hashtags",
      "instagramCaption": "Engaging Instagram caption with emojis and spacing",
      "youtubeShortsCaption": "Direct, SEO-friendly caption for YT Shorts",
      "callToAction": "A strong CTA line to end the post (optionally signed by the coach)"
    }
    
    Match the tone to a ${goal} workout, ${creatorMode || "standard"} format, and the coach's identity.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating social captions:", error);
    return null;
  }
}
