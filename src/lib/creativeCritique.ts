import { CompositionBlueprint } from "./compositionPlanner";
import { PerceptionScore } from "./perceptionModel";
import { getCompositionMemory } from "./compositionMemory";

export interface CritiqueDimensions {
  pacingVariance: number;
  silenceIntentionality: number;
  subtitleRestraint: number;
  originality: number;
  recoveryIntelligence: number;
}

export interface CandidateCritique {
  pacingArc: string;
  perceptionScore: number;
  primaryWeakness: string;
  primaryStrength: string;
}

export interface CompositionConfidenceProfile {
  pacingConfidence: number;
  emotionalConfidence: number;
  audienceFitConfidence: number;
  originalityConfidence: number;
  overallConfidence: number;
}

export interface EditorialReflection {
  blueprintId: string;
  critique: CritiqueDimensions;
  confidence: CompositionConfidenceProfile;
  counterfactuals: CandidateCritique[];
  driftWarning: string | null;
  evolutionaryGuidance: string;
  timestamp: number;
}

const CRITIQUE_MEMORY_KEY = "stretchingpro_critique_memory";

export function getCritiqueMemory(): EditorialReflection[] {
  try {
    const raw = localStorage.getItem(CRITIQUE_MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCritiqueMemory(memory: EditorialReflection[]) {
  try {
    localStorage.setItem(CRITIQUE_MEMORY_KEY, JSON.stringify(memory));
  } catch(e) {}
}

export function performEditorialReflection(
  selectedBlueprint: CompositionBlueprint,
  selectedPerception: PerceptionScore,
  rejectedCandidates: { blueprint: CompositionBlueprint, perception: PerceptionScore }[]
): EditorialReflection {
  const memory = getCompositionMemory();
  const pastReflections = getCritiqueMemory();

  // 1. Counterfactual Analysis
  const counterfactuals: CandidateCritique[] = rejectedCandidates.map(c => {
    let weakness = "Unknown";
    let strength = "Unknown";

    if (c.perception.flaggedRisks.length > 0) {
      weakness = c.perception.flaggedRisks[0];
    } else if (c.perception.cognitiveFatigue < 70) {
      weakness = "High cognitive fatigue";
    } else {
      weakness = "Insufficient structural score / pacing variance";
    }

    if (c.perception.emotionalArc > 80) strength = "Strong emotional arc continuity";
    else if (c.perception.silenceIntelligence > 80) strength = "Excellent breathing room & silence spacing";
    else strength = "Adequate structural integrity";

    return {
      pacingArc: c.blueprint.metadata?.pacingArc || "steady",
      perceptionScore: c.perception.totalScore,
      primaryWeakness: weakness,
      primaryStrength: strength
    };
  });

  // 2. Creative Drift Detection (compare against past history)
  let driftWarning: string | null = null;
  let originalityScore = 100;
  
  if (memory.length >= 3) {
    const lastPacing = memory.slice(-3).map(m => m.metadata?.pacingArc);
    const allSamePacing = lastPacing.every(p => p === selectedBlueprint.metadata.pacingArc);
    
    if (allSamePacing) {
      driftWarning = `Creative Drift Detected: System has over-relied on '${selectedBlueprint.metadata.pacingArc}' pacing. Risk of compositional stagnation. Introduce controlled novelty.`;
      originalityScore -= 30;
    }
  }

  // 3. Critique Dimensions
  const critique: CritiqueDimensions = {
    pacingVariance: selectedPerception.emotionalArc, 
    silenceIntentionality: selectedPerception.silenceIntelligence,
    subtitleRestraint: selectedPerception.cognitiveFatigue,
    originality: originalityScore,
    recoveryIntelligence: (selectedBlueprint.metadata.pacingArc === "cool-down" || selectedBlueprint.metadata.pacingArc === "steady") ? 90 : 60
  };

  // 4. Composition Confidence Modeling
  const confidence: CompositionConfidenceProfile = {
    pacingConfidence: Math.min(100, (critique.pacingVariance + critique.recoveryIntelligence) / 2),
    emotionalConfidence: selectedPerception.emotionalArc,
    audienceFitConfidence: selectedPerception.totalScore, // Represents distribution fit mapping
    originalityConfidence: originalityScore,
    overallConfidence: Math.round((selectedPerception.totalScore + originalityScore) / 2)
  };

  // 5. Evolutionary Guidance
  let guidance = "Maintain current trajectory.";
  if (confidence.overallConfidence < 70) {
     guidance = "Confidence low. Prioritize structural stability and familiar identity profiles. Resist novel experiments.";
  } else if (confidence.originalityConfidence < 60) {
     guidance = "High confidence but originality is drifting towards repetition. Authorizes controlled pacing experiments in next session.";
  } else if (confidence.overallConfidence > 85) {
     guidance = "Confident mastery achieved. Subtle innovations in subtitle cadence or alternative transitions are approved.";
  }

  const reflection: EditorialReflection = {
    blueprintId: selectedBlueprint.metadata.generationSeed,
    critique,
    confidence,
    counterfactuals,
    driftWarning,
    evolutionaryGuidance: guidance,
    timestamp: Date.now()
  };

  pastReflections.push(reflection);
  saveCritiqueMemory(pastReflections);

  return reflection;
}
