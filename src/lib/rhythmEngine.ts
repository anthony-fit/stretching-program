export type TemporalElasticity =
  | "suspended"
  | "grounded"
  | "drifting"
  | "calming"
  | "accelerating"
  | "dissolving"
  | "widening_spaciousness";

export type SilenceArchitecture =
  | "pre_resolution_silence"
  | "post_impact_stillness"
  | "decompression_gaps"
  | "reflective_recovery_windows"
  | "nervous_system_release_spacing";

export type TemporalAtmosphere =
  | "widening_calmness"
  | "narrowing_intensity"
  | "suspended_stillness"
  | "progressive_grounding"
  | "emotional_expansion"
  | "release_stabilization";

export interface RhythmState {
  feltElasticity: TemporalElasticity;
  silenceStructure: SilenceArchitecture;
  atmosphereField: TemporalAtmosphere;
  longFormOscillation: {
    requiresDecompression: boolean; // Based on longitudinal fatigue
    rhythmWidening: boolean; // Expanding the feeling of time to reduce tension
  };
}

export function determineFeltRhythm(
  archetype: string,
  fatigueIndex: number,
  environmentalState: string,
): RhythmState {
  let elasticity: TemporalElasticity = "grounded";
  let silence: SilenceArchitecture = "reflective_recovery_windows";
  let atmosphere: TemporalAtmosphere = "release_stabilization";

  let requiresDecompression =
    fatigueIndex > 60 || environmentalState === "fatigued";
  let rhythmWidening = fatigueIndex > 40;

  if (archetype === "restoration" || requiresDecompression) {
    elasticity = "suspended";
    silence = "decompression_gaps";
    atmosphere = "widening_calmness";
  } else if (archetype === "decompression") {
    elasticity = "dissolving";
    silence = "nervous_system_release_spacing";
    atmosphere = "progressive_grounding";
  } else if (archetype === "controlled_activation") {
    elasticity = "accelerating";
    silence = "pre_resolution_silence";
    atmosphere = "emotional_expansion";
  } else {
    // grounded_discipline
    elasticity = "calming";
    silence = "post_impact_stillness";
    atmosphere = "suspended_stillness";
  }

  // Adjust for extreme overstimulation/compulsive pacing
  if (
    environmentalState === "overstimulated" ||
    environmentalState === "compulsive_revision"
  ) {
    elasticity = "suspended";
    silence = "nervous_system_release_spacing";
    atmosphere = "widening_calmness";
    rhythmWidening = true;
    requiresDecompression = true;
  }

  return {
    feltElasticity: elasticity,
    silenceStructure: silence,
    atmosphereField: atmosphere,
    longFormOscillation: {
      requiresDecompression,
      rhythmWidening,
    },
  };
}
