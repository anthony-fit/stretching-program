export type NarrativeArchetype =
  | "restoration"
  | "awakening"
  | "reconstruction"
  | "resilience"
  | "decompression"
  | "controlled_activation"
  | "emotional_release"
  | "grounded_discipline";

export type SymbolicMotif =
  | "calm_emergence"
  | "breath_space"
  | "grounded_stillness"
  | "progressive_expansion"
  | "structural_resilience"
  | "controlled_tension_release"
  | "restorative_decay"
  | "silent_integration";

export interface EmotionalResonanceProfile {
  archetype: NarrativeArchetype;
  primaryMotif: SymbolicMotif;
  secondaryMotif: SymbolicMotif;
  thematicContinuity: string;
}

export interface MeaningResolutionScore {
  resolutionScore: number;
  emotionalClosure: boolean;
  resolutionRisks: string[];
}

export function determineNarrativeArchetype(
  pacingArc: string,
  recoveryDebt: number,
): NarrativeArchetype {
  if (recoveryDebt > 70) {
    if (pacingArc === "cool-down") return "decompression";
    if (pacingArc === "steady") return "restoration";
    return "emotional_release";
  }

  if (pacingArc === "intervals" || pacingArc === "waves") {
    return "resilience";
  }

  if (pacingArc === "build-up") {
    return "controlled_activation";
  }

  return "grounded_discipline";
}

export function generateSymbolicMotifs(
  archetype: NarrativeArchetype,
  pastMotifs: SymbolicMotif[],
): {
  primary: SymbolicMotif;
  secondary: SymbolicMotif;
  driftWarning: string | null;
} {
  // Candidate motifs per archetype
  const motifMap: Record<NarrativeArchetype, SymbolicMotif[]> = {
    restoration: ["grounded_stillness", "restorative_decay", "breath_space"],
    awakening: ["calm_emergence", "progressive_expansion"],
    reconstruction: ["structural_resilience", "grounded_stillness"],
    resilience: ["controlled_tension_release", "structural_resilience"],
    decompression: ["restorative_decay", "silent_integration"],
    controlled_activation: [
      "progressive_expansion",
      "controlled_tension_release",
    ],
    emotional_release: ["breath_space", "controlled_tension_release"],
    grounded_discipline: ["grounded_stillness", "structural_resilience"],
  };

  const available = motifMap[archetype] || [
    "grounded_stillness",
    "breath_space",
  ];

  // Emotional Symbol Drift Detection
  let driftWarning = null;
  const recentPrimary = pastMotifs.slice(-3);

  let primary = available[0];
  let secondary = available[1] || "silent_integration";

  if (recentPrimary.every((m) => m === primary) && recentPrimary.length === 3) {
    driftWarning = `Symbolic Drift Detected: Overuse of '${primary}' motif. Shifting emotional language to prevent mythological stagnation.`;
    primary =
      available[available.length - 1] !== primary
        ? available[available.length - 1]
        : "silent_integration";
  }

  return { primary, secondary, driftWarning };
}

export function evaluateMeaningResolution(
  blueprint: any,
  archetype: NarrativeArchetype,
): MeaningResolutionScore {
  let score = 100;
  const risks: string[] = [];

  const finalScene = blueprint.scenes?.[blueprint.scenes.length - 1];
  const soundtrack = blueprint.soundtrackProfile || "ambient";
  const pacingArc = blueprint.pacingArc || "steady";

  // Check if resolution feels earned
  if (finalScene) {
    if (
      finalScene.energyLevel === "peak" ||
      finalScene.energyLevel === "high"
    ) {
      risks.push(
        "Composition ends on high energy. Emotional atmosphere fails to settle.",
      );
      score -= 30;
    }
  }

  if (archetype === "decompression" || archetype === "restoration") {
    if (soundtrack === "heavy" || soundtrack === "upbeat") {
      risks.push("Soundtrack decay contradicts restoration archetype.");
      score -= 25;
    }
    if (pacingArc === "intervals") {
      risks.push("Interval pacing leaves emotional resolution fractured.");
      score -= 20;
    }
  }

  if (archetype === "resilience" || archetype === "controlled_activation") {
    if (blueprint.scenes?.length < 3) {
      risks.push(
        "Insufficient narrative duration to earn resilience arc closure.",
      );
      score -= 15;
    }
  }

  return {
    resolutionScore: Math.max(0, score),
    emotionalClosure: score >= 80,
    resolutionRisks: risks,
  };
}
