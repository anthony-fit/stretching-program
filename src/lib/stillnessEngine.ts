export interface SilenceSovereigntyInvariants {
  stillnessIsValidOutcome: boolean;
  nonGenerationIsNotFailure: boolean;
  recoveryOutranksNovelty: boolean;
  silenceCompletesMeaning: boolean;
  restraintPreservesDignity: boolean;
  calmnessOutranksProduction: boolean;
}

export interface CreativeSaturation {
  symbolicIntensityOverload: boolean;
  pacingDensitySaturated: boolean;
  generationCompulsionDetected: boolean;
  continuityOverloaded: boolean;
  recoverySpaceInsufficient: boolean;
  overallSaturationIndex: number; // 0-100
}

export interface StillnessRecommendation {
  shouldGenerate: boolean;
  restorativeSilenceStateActive: boolean;
  dignifiedRestraintMessage?: string;
}

export interface SystemStillnessState {
  invariants: SilenceSovereigntyInvariants;
  saturation: CreativeSaturation;
  recommendation: StillnessRecommendation;
}

export function evaluateStillness(
  recentSubmissions: number,
  sessionDurationMins: number,
  purposeDriftDetected: boolean,
  fatigueIndex: number,
): SystemStillnessState {
  // Non-negotiable laws protecting the right to non-generation
  const invariants: SilenceSovereigntyInvariants = {
    stillnessIsValidOutcome: true,
    nonGenerationIsNotFailure: true,
    recoveryOutranksNovelty: true,
    silenceCompletesMeaning: true,
    restraintPreservesDignity: true,
    calmnessOutranksProduction: true,
  };

  const generationCompulsionDetected =
    recentSubmissions > 4 && sessionDurationMins > 45;
  const pacingDensitySaturated = fatigueIndex > 80;
  const continuityOverloaded = purposeDriftDetected;

  const saturationScore =
    (generationCompulsionDetected ? 40 : 0) +
    (pacingDensitySaturated ? 30 : 0) +
    (continuityOverloaded ? 30 : 0);

  let recommendation: StillnessRecommendation = {
    shouldGenerate: true,
    restorativeSilenceStateActive: false,
  };

  if (saturationScore >= 70) {
    recommendation = {
      shouldGenerate: false,
      restorativeSilenceStateActive: true,
      dignifiedRestraintMessage:
        "Emotional density is already sufficient. Silence and reflection are structurally healthier than additional stimulation right now.",
    };
  } else if (saturationScore >= 40) {
    recommendation = {
      shouldGenerate: true, // Permitted, but heavily constrained workspace
      restorativeSilenceStateActive: true,
      dignifiedRestraintMessage:
        "Recovery continuity is stronger through spaciousness. Proceeding with extreme restraint.",
    };
  }

  return {
    invariants,
    saturation: {
      symbolicIntensityOverload: pacingDensitySaturated,
      pacingDensitySaturated,
      generationCompulsionDetected,
      continuityOverloaded,
      recoverySpaceInsufficient: saturationScore >= 50,
      overallSaturationIndex: saturationScore,
    },
    recommendation,
  };
}
