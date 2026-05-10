import { Router } from "express";
import {
  generateAIVideo,
  generateCompositionBlueprintViaLLM,
  generateRoutineScript,
  generateSEOMetadata,
  generateSocialCaptions,
} from "../services/groq";


const router = Router();

router.post("/generate-composition", async (req, res) => {
  try {
    const { prefs, exerciseDatabaseSummary } = req.body;

    const result = await generateCompositionBlueprintViaLLM(
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
