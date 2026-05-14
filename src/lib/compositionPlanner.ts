import { Exercise, EXERCISE_DATABASE } from "../data/exercises";
import { generateCompositionBlueprintViaLLM } from "../api/client";
import { enforceGovernance } from "./compositionGovernance";
import {
  getLearnedTasteProfile,
  scoreComposition,
  getCompositionMemory,
} from "./compositionMemory";
import { simulateViewerExperience } from "./perceptionModel";
import { getCurrentContinuityState } from "./continuityEngine";
import {
  AudienceContext,
  evaluateDistributionContext,
} from "./distributionIntelligence";
import {
  observeCollectiveEmotionalTruths,
  applyCollectiveIntelligence,
} from "./collectiveIntelligence";
import { performEditorialReflection } from "./creativeCritique";
import {
  determineAestheticPhilosophy,
  evaluateAestheticCoherence,
  determineIntentionalNovelty,
  generateCompositionMoodField,
} from "./aestheticEngine";
import { getCritiqueMemory } from "./creativeCritique";
import {
  determineNarrativeArchetype,
  generateSymbolicMotifs,
  evaluateMeaningResolution,
} from "./symbolicEngine";
import { getEvolutionState, logTemporalEvolution } from "./evolutionEngine";
import {
  observeEnvironmentalPresence,
  applyReciprocalCalmness,
  InteractionSignals,
} from "./presenceEngine";
import { determineFeltRhythm } from "./rhythmEngine";
import { validateExistentialCoherence } from "./purposeEngine";
import { evaluateStillness } from "./stillnessEngine";

export interface CompositionBlueprint {
  title: string;
  hook: string;
  pacingArc: "steady" | "build-up" | "intervals" | "cool-down" | "waves";
  soundtrackProfile: "cinematic" | "upbeat" | "ambient" | "lofi" | "heavy";
  transitionRhythm: "fast" | "medium" | "slow" | "mixed";
  subtitleCadence: "rapid" | "standard" | "relaxed";
  reasoning: string;
  metadata?: {
    blueprintVersion: string;
    orchestrationVersion: string;
    compositionModel: string;
    governanceProfile: string;
    generationSeed: string;
    perceptionScore?: number;
    title?: string;
    hook?: string;
    pacingArc?: string;
    soundtrackProfile?: string;
    aestheticPhilosophy?: string;
    moodField?: any;
    narrativeArchetype?: string;
    symbolicMotifs?: any;
  };
  scenes: {
    exerciseId: string;
    duration: number;
    script: string;
    cameraBehavior: "static" | "slow-zoom" | "pan" | "dynamic";
    energyLevel: "low" | "medium" | "high" | "peak";
  }[];
}

export async function generateCompositionBlueprint(prefs: {
  duration: string;
  durationMinutes?: number;
  type: string;
  level: string;
  focus: string;
  painPoints: string[];
  equipment: string[];
  intensity: string;
  coachingStyle: string;
  audienceContext?: any;
  exercises?: Exercise[];
}): Promise<CompositionBlueprint | null> {
  // We summarize the database for the LLM
  let sourceDB = prefs.exercises && prefs.exercises.length > 0 ? prefs.exercises : EXERCISE_DATABASE;
  
  // To avoid hitting API rate limits (TPM: 12000 for Llama 3.3 70B),
  // we will randomly sample up to 100 exercises from the eligible pool.
  if (sourceDB.length > 100) {
    const shuffled = [...sourceDB].sort(() => 0.5 - Math.random());
    sourceDB = shuffled.slice(0, 100);
  }

  const dbSummary = sourceDB.map(
    (ex) =>
      `[${ex.id}] ${ex.name} | Cat:${ex.category} | Mus:${(ex.focus || []).join(",")} | Eq:${(ex.equipment || []).join(",")} | Lvl:${ex.level}`
  ).join("\\n");

    // Inject learned taste profile from Composition Memory
  console.log(`[DEBUG] Total exercises mapped to string: ${sourceDB.length}, lines: ${dbSummary.split("\\n").length}, approx string size: ${dbSummary.length} chars`);
  const tasteProfile = getLearnedTasteProfile();

  // Predict Session-to-Session continuity
  const continuityState = getCurrentContinuityState();

  // Audience Context / Distribution Intelligence
  const audienceContext: AudienceContext = prefs.audienceContext || {
    platform: "web_app",
    viewingEnvironment: "personal_coaching",
    soundAvailability: "speakers",
  };
  const distributionConstraints = evaluateDistributionContext(audienceContext);

  // Creative Philosophy
  const philosophy = determineAestheticPhilosophy(
    continuityState.identityProfile,
  );
  const pastReflections = getCritiqueMemory();
  const pastPacingArcs = pastReflections.map(
    (r) =>
      r.counterfactuals.find((c) => c.perceptionScore > 0)?.pacingArc ||
      "steady",
  );
  const intentionalNovelty = determineIntentionalNovelty(
    pastPacingArcs,
    philosophy,
  );

  // Evolution Engine
  const evolutionState = getEvolutionState(pastReflections);
  logTemporalEvolution(evolutionState);

  // Symbolic Engine
  const memoryForSymbols = getCompositionMemory();
  const pastMotifs = memoryForSymbols
    .map((m: any) => m.metadata?.symbolicMotifs?.primary)
    .filter(Boolean);
  const targetArchetype = determineNarrativeArchetype(
    prefs.intensity === "high" ? "intervals" : "steady", // rough heuristic to guide LLM
    continuityState.recoveryDebt,
  );
  const symbolicState = generateSymbolicMotifs(targetArchetype, pastMotifs);

  // Collective Pattern Intelligence
  const collectiveTruths = observeCollectiveEmotionalTruths();
  const collectiveTendencies = applyCollectiveIntelligence(
    continuityState.identityProfile,
    collectiveTruths,
  );

  // Environmental Presence
  const mockSignals: InteractionSignals = {
    timeOfDay:
      new Date().getHours() >= 18 || new Date().getHours() < 5
        ? "night"
        : "afternoon",
    editingPace: "deliberate", // In a real system, this comes from frontend telemetry tracking interaction rate
    revisionLoops:
      pastReflections.length > 5 ? Math.floor(Math.random() * 6) : 0,
    soundtrackIndecision: false,
    abandonmentRate: "moderate",
    sessionDurationMins: 45, // mock value
  };
  const presenceState = observeEnvironmentalPresence(mockSignals);

  // Rhythm Engine (Temporal Intelligence)
  const rhythmState = determineFeltRhythm(
    targetArchetype,
    collectiveTruths.fatigueIntelligence.overallFatigueIndex,
    presenceState.editorState,
  );

  // Purpose Engine (Existential Coherence)
  const purposeState = validateExistentialCoherence(
    evolutionState.stability.maturityScore,
    collectiveTruths.fatigueIntelligence.overallFatigueIndex,
    rhythmState.feltElasticity,
  );

  // Stillness Engine (The Right to Non-Generation)
  const stillnessState = evaluateStillness(
    pastReflections.length,
    mockSignals.sessionDurationMins,
    purposeState.drift.isDrifting,
    collectiveTruths.fatigueIntelligence.overallFatigueIndex,
  );

  if (!stillnessState.recommendation.shouldGenerate) {
    console.log(
      "[STILLNESS ENGINE] Halting generation:",
      stillnessState.recommendation.dignifiedRestraintMessage,
    );
    // Return a "Restorative Stillness" blueprint
    return {
      title: "Restorative Silence",
      hook: "Embrace the silence.",
      pacingArc: "cool-down",
      soundtrackProfile: "ambient",
      transitionRhythm: "slow",
      subtitleCadence: "relaxed",
      reasoning:
        "The system has detected that emotional density is already sufficient. Silence and reflection are structurally healthier than additional stimulation right now.",
      metadata: {
        blueprintVersion: "1.0",
        orchestrationVersion: "1.0",
        compositionModel: "StillnessEngine",
        governanceProfile: "Restraint",
        generationSeed: "none",
      },
      scenes: [],
    };
  }

  let enrichedPrefs = {
    ...prefs,
    learnedTaste: tasteProfile,
    continuity: continuityState,
    audienceContext,
    distributionConstraints,
    aestheticPhilosophy: philosophy,
    intentionalNovelty,
    evolutionState,
    collectiveTendencies,
    symbolicState: {
      targetArchetype,
      ...symbolicState,
    },
    rhythmState,
    purposeState,
    stillnessState,
  };

  enrichedPrefs = applyReciprocalCalmness(presenceState, enrichedPrefs);

  // Sanitize payload to prevent cyclic object errors during JSON.stringify
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      if (typeof value === "function") return undefined;
      if (
        typeof window !== "undefined" &&
        (value instanceof Element || value instanceof Window)
      )
        return undefined;
      return value;
    };
  };

  const sanitizedPrefs = JSON.parse(
    JSON.stringify(enrichedPrefs, getCircularReplacer()),
  );

  const candidates = await generateCompositionBlueprintViaLLM(
    sanitizedPrefs,
    dbSummary,
  ) as any[];

  if (candidates && Array.isArray(candidates) && candidates.length > 0) {
    const targetSeconds = prefs.durationMinutes
      ? prefs.durationMinutes * 60
      : parseInt(prefs.duration);

    // Multi-Candidate Internal Drafting
    let bestCandidate: CompositionBlueprint | null = null;
    let highestScore = -Infinity;
    const evaluatedCandidates: {
      blueprint: CompositionBlueprint;
      perception: any;
      score: number;
    }[] = [];

    candidates.forEach((candidate: any) => {
      if (
        !candidate ||
        !candidate.scenes ||
        !Array.isArray(candidate.scenes) ||
        candidate.scenes.length === 0
      ) {
        console.warn(
          "[PIPELINE] Invalid Groq blueprint structure - Rejecting candidate",
        );
        return;
      }

      // 1. Governance
      const governed = enforceGovernance(
        candidate,
        targetSeconds,
        distributionConstraints,
      );

      // 2. Perception Model Scoring
      const perception = simulateViewerExperience(governed, audienceContext);

      // 3. Memory Structure Scoring
      const structuralScore = scoreComposition(governed);

      // 4. Aesthetic Consistency Modeling
      const aesthetic = evaluateAestheticCoherence(governed, philosophy);

      // 5. Symbolic Engine & Meaning Resolution
      const archetype = determineNarrativeArchetype(
        governed.pacingArc || "steady",
        continuityState.recoveryDebt,
      );
      const resolution = evaluateMeaningResolution(governed, archetype);

      const finalScore =
        perception.totalScore * 0.4 +
        structuralScore * 0.2 +
        aesthetic.coherenceScore * 0.2 +
        resolution.resolutionScore * 0.2;

      evaluatedCandidates.push({
        blueprint: governed,
        perception,
        score: finalScore,
      });

      if (governed.metadata) {
        governed.metadata.aestheticPhilosophy = philosophy;
        governed.metadata.moodField = generateCompositionMoodField(
          governed.pacingArc || "steady",
        );
        governed.metadata.narrativeArchetype = archetype;

        // Extract past motifs to generate new ones
        const memory = getCompositionMemory();
        const pastMotifs = memory
          .map((m: any) => m.metadata?.symbolicMotifs?.primary)
          .filter(Boolean);
        governed.metadata.symbolicMotifs = generateSymbolicMotifs(
          archetype,
          pastMotifs,
        );
      }

      if (finalScore > highestScore) {
        highestScore = finalScore;
        if (governed.metadata) {
          governed.metadata.perceptionScore = Math.round(finalScore);
        }
        bestCandidate = governed;
      }
    });

    if (bestCandidate) {
      const bestCandidateData = evaluatedCandidates.find(
        (c) => c.blueprint === bestCandidate,
      )!;
      const rejectedCandidates = evaluatedCandidates.filter(
        (c) => c.blueprint !== bestCandidate,
      );

      // 4. Creative Critique & Editorial Reflection
      performEditorialReflection(
        bestCandidateData.blueprint,
        bestCandidateData.perception,
        rejectedCandidates,
      );
    }

    return bestCandidate;
  }

  return null;
}
