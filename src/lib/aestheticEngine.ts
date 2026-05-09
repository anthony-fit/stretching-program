export type AestheticPhilosophy =
  | "restrained_cinematic"
  | "meditative_editorial"
  | "athletic_documentary"
  | "movement_poetry"
  | "precision_minimalism"
  | "emotional_recovery"
  | "quiet_authority";

export interface MoodField {
  emergence: string;
  activation: string;
  stabilization: string;
  resolution: string;
}

export interface AestheticCoherenceScore {
  coherenceScore: number;
  internalHarmony: boolean;
  philosophicalViolations: string[];
}

export function determineAestheticPhilosophy(
  identityProfile: string,
): AestheticPhilosophy {
  const map: Record<string, AestheticPhilosophy> = {
    restrained_cinematic: "restrained_cinematic",
    meditative_precision: "precision_minimalism",
    athletic_documentary: "athletic_documentary",
    recovery_editorial: "emotional_recovery",
    calm_authoritative: "quiet_authority",
    energetic_performance: "athletic_documentary",
  };
  return map[identityProfile] || "restrained_cinematic";
}

export function generateCompositionMoodField(pacingArc: string): MoodField {
  switch (pacingArc) {
    case "steady":
      return {
        emergence: "calm emergence",
        activation: "grounded activation",
        stabilization: "reflective stabilization",
        resolution: "restorative resolution",
      };
    case "build-up":
      return {
        emergence: "curious awakening",
        activation: "focused momentum",
        stabilization: "peak flow",
        resolution: "earned decompression",
      };
    case "intervals":
    case "waves":
      return {
        emergence: "rhythmic entry",
        activation: "controlled tension",
        stabilization: "dynamic release",
        resolution: "settled grounding",
      };
    case "cool-down":
      return {
        emergence: "soft transition",
        activation: "gentle unwinding",
        stabilization: "deep release",
        resolution: "stillness",
      };
    default:
      return {
        emergence: "calm emergence",
        activation: "steady presence",
        stabilization: "balanced focus",
        resolution: "quiet completion",
      };
  }
}

export function evaluateAestheticCoherence(
  blueprint: any,
  philosophy: AestheticPhilosophy,
): AestheticCoherenceScore {
  let score = 100;
  const violations: string[] = [];

  const soundtrack = blueprint.soundtrackProfile || "ambient";
  const cadence = blueprint.subtitleCadence || "standard";
  const hasPeaks = blueprint.scenes?.some((s: any) => s.energyLevel === "peak");

  if (
    philosophy === "precision_minimalism" ||
    philosophy === "meditative_editorial"
  ) {
    if (soundtrack === "heavy" || soundtrack === "upbeat") {
      violations.push(
        `Soundtrack '${soundtrack}' violates the stillness required for ${philosophy}.`,
      );
      score -= 30;
    }
    if (cadence === "rapid") {
      violations.push(
        `Rapid subtitle cadence disrupts the visual breathing room of ${philosophy}.`,
      );
      score -= 20;
    }
  }

  if (
    philosophy === "emotional_recovery" ||
    philosophy === "restrained_cinematic"
  ) {
    if (hasPeaks && blueprint.pacingArc !== "waves") {
      violations.push(
        `Peak energy scenes contradict the restorative mandate of ${philosophy}.`,
      );
      score -= 25;
    }
  }

  if (philosophy === "quiet_authority") {
    if (cadence === "rapid") {
      violations.push(
        `Over-narration compromises the presence of quiet_authority.`,
      );
      score -= 20;
    }
  }

  return {
    coherenceScore: Math.max(0, score),
    internalHarmony: violations.length === 0,
    philosophicalViolations: violations,
  };
}

export function determineIntentionalNovelty(
  pastPacingArcs: string[],
  currentPhilosophy: AestheticPhilosophy,
): string[] {
  const directions: string[] = [];

  if (pastPacingArcs.length >= 3) {
    const recent = pastPacingArcs.slice(-3);
    const allSame = recent.every((p) => p === recent[0]);

    if (allSame) {
      if (
        currentPhilosophy === "precision_minimalism" ||
        currentPhilosophy === "restrained_cinematic"
      ) {
        directions.push(
          "Introduce pacing asymmetry: extend silence intervals by 15%.",
        );
      } else if (currentPhilosophy === "athletic_documentary") {
        directions.push(
          "Shift visual narrative: introduce a reflective opening before activation.",
        );
      } else {
        directions.push(
          "Subtle evolution: soften the transition out of peak activation.",
        );
      }
    }
  }

  return directions;
}
