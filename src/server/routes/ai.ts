import { Router } from "express";
import {
  generateAIVideo,
  generateCompositionBlueprintViaLLM,
  generateRoutineScript,
  generateSEOMetadata,
  generateSocialCaptions,
  classifyWorkoutIntentViaLLM,
} from "../services/groq.ts";


const router = Router();

router.post("/classify-intent", async (req, res) => {
  try {
    const { promptText } = req.body;

    const result = await classifyWorkoutIntentViaLLM(
      process.env.GROQ_API_KEY || "",
      promptText
    );

    res.json(result);
  } catch (error: any) {
    if (error?.message && !error.message.includes("Invalid URL")) {
       console.warn("[AI ROUTE] classify-intent fallback activated");
    }
    
    res.status(500).json({
      error: "Failed to classify intent",
      details: error?.message || "Unknown error",
    });
  }
});

router.post("/generate-composition", async (req, res) => {
  try {
    const { prefs, exerciseDatabaseSummary } = req.body;

    const result = await generateCompositionBlueprintViaLLM(
      process.env.GROQ_API_KEY || "",
      prefs,
      exerciseDatabaseSummary,
    );

    res.json(result);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-composition failed", error);

    res.status(500).json({
      error: "Failed to generate composition blueprint",
      details: error?.message || "Unknown error",
    });
  }
});

router.post("/generate-script", async (req, res) => {
  try {
    const { exercises, goal, creatorMode, context } = req.body;

    const result = await generateRoutineScript(
      process.env.GROQ_API_KEY || "",
      exercises,
      goal,
      creatorMode,
      context,
    );

    res.json(result);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-script failed", error);

    res.status(500).json({
      error: "Failed to generate routine script",
      details: error?.message || "Unknown error",
    });
  }
});

router.post("/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body;

    const operation = await generateAIVideo(prompt);

    res.json(operation);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-video failed", error);

    res.status(500).json({
      error: "Failed to generate AI video",
      details: error?.message || "Unknown error",
    });
  }
});

router.post("/generate-seo", async (req, res) => {
  try {
    const { exercises, goal, context } = req.body;

    const result = await generateSEOMetadata(
      process.env.GROQ_API_KEY || "",
      exercises,
      goal,
      context,
    );

    res.json(result);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-seo failed", error);

    res.status(500).json({
      error: "Failed to generate SEO metadata",
      details: error?.message || "Unknown error",
    });
  }
});

router.post("/generate-social", async (req, res) => {
  try {
    const { exercises, goal, creatorMode, context } = req.body;

    const result = await generateSocialCaptions(
      process.env.GROQ_API_KEY || "",
      exercises,
      goal,
      creatorMode,
      context,
    );

    res.json(result);
  } catch (error: any) {
    console.error("[AI ROUTE] generate-social failed", error);

    res.status(500).json({
      error: "Failed to generate social captions",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;
