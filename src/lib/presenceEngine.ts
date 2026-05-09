export interface InteractionSignals {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  editingPace: "deliberate" | "rapid" | "erratic" | "hesitant";
  revisionLoops: number;
  soundtrackIndecision: boolean;
  abandonmentRate: "low" | "moderate" | "high";
  sessionDurationMins: number;
}

export interface WorkspaceAtmosphere {
  visualContrast: "standard" | "softened" | "minimal";
  animationPacing: "standard" | "slowed" | "suppressed";
  uiComplexity: "standard" | "simplified";
}

export interface PresenceState {
  editorState:
    | "focused"
    | "fatigued"
    | "overstimulated"
    | "reflective"
    | "compulsive_revision";
  workspaceAdaptation: WorkspaceAtmosphere;
  cinematicReciprocity: {
    enforceSilenceExtension: boolean;
    suppressPeakEnergy: boolean;
    prioritizeRecovery: boolean;
    softenNarrativeDensity: boolean;
  };
  sustainabilityScore: number;
}

export function observeEnvironmentalPresence(
  signals: InteractionSignals,
): PresenceState {
  let state: PresenceState["editorState"] = "focused";

  let fatigueScore = 0;
  let overstimulationScore = 0;

  if (signals.timeOfDay === "night" || signals.sessionDurationMins > 90)
    fatigueScore += 30;
  if (signals.editingPace === "erratic") overstimulationScore += 40;
  if (signals.revisionLoops > 5) overstimulationScore += 30;
  if (signals.soundtrackIndecision) overstimulationScore += 20;
  if (signals.abandonmentRate === "high") fatigueScore += 25;
  if (signals.editingPace === "hesitant") fatigueScore += 20;

  if (overstimulationScore > 60 && signals.revisionLoops > 8) {
    state = "compulsive_revision";
  } else if (overstimulationScore > 50) {
    state = "overstimulated";
  } else if (fatigueScore > 40) {
    state = "fatigued";
  } else if (
    signals.editingPace === "deliberate" &&
    signals.timeOfDay === "evening"
  ) {
    state = "reflective";
  }

  const workspaceAdaptation: WorkspaceAtmosphere = {
    visualContrast:
      state === "fatigued" || state === "overstimulated"
        ? "softened"
        : "standard",
    animationPacing:
      state === "compulsive_revision" || state === "fatigued"
        ? "slowed"
        : "standard",
    uiComplexity:
      state === "overstimulated" || state === "compulsive_revision"
        ? "simplified"
        : "standard",
  };

  const cinematicReciprocity = {
    enforceSilenceExtension: state === "fatigued" || state === "overstimulated",
    suppressPeakEnergy: state === "fatigued" || state === "compulsive_revision",
    prioritizeRecovery: state === "fatigued" || state === "reflective",
    softenNarrativeDensity:
      state === "overstimulated" || state === "compulsive_revision",
  };

  const sustainabilityScore = Math.max(
    0,
    100 - (fatigueScore + overstimulationScore) / 2,
  );

  return {
    editorState: state,
    workspaceAdaptation,
    cinematicReciprocity,
    sustainabilityScore,
  };
}

export function applyReciprocalCalmness(
  presence: PresenceState,
  prefs: any,
): any {
  if (
    presence.cinematicReciprocity.suppressPeakEnergy &&
    prefs.intensity === "high"
  ) {
    prefs.intensity = "moderate"; // Gently cap intensity
  }

  return {
    ...prefs,
    presenceAtmosphere: presence,
  };
}
