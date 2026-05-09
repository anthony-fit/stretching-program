import { UserProgression } from "../programming";
import { calculateReadiness } from "../programming";

/**
 * System State determines the ambient intelligence layer of the application.
 * recovery: Slows animations, softens contrast, prioritizes calm.
 * momentum: Sharper timing, energetic transitions, high contrast.
 * deep-work: Dims atmosphere, reduces distractions, workspace dominance.
 * maintenance: Standard baseline.
 */
export type SystemState = "recovery" | "momentum" | "deep-work" | "maintenance";

/**
 * Derives the active System State based on context
 */
export function getAdaptiveState(
  progression: UserProgression | null,
  activeSessionDurationMinutes: number
): SystemState {
  // If the user has been editing for 15+ minutes, go into focus mode.
  if (activeSessionDurationMinutes >= 15) {
    return "deep-work";
  }

  if (!progression) return "maintenance";

  const readiness = calculateReadiness(progression);

  if (readiness.score < 60) {
    return "recovery";
  }

  if (progression.momentumScore > 80 && readiness.score >= 75) {
    return "momentum";
  }

  return "maintenance";
}

/**
 * Helper to get the motion/pacing modifier based on system state
 */
export function getStateMotionMultiplier(state: SystemState): number {
  switch (state) {
    case "recovery": return 1.25; // 25% slower animations
    case "momentum": return 0.8;  // 20% faster, sharper animations
    case "deep-work": return 0.5; // Very fast, getting out of the way
    default: return 1.0;
  }
}

/**
 * Helper to get ambient visual class overrides
 */
export function getStateAmbientClasses(state: SystemState): string {
  switch (state) {
    case "recovery": 
      return "saturate-90 opacity-80 backdrop-blur-xl contrast-95";
    case "momentum": 
      return "saturate-110 opacity-100 contrast-105";
    case "deep-work": 
      return "opacity-40 saturate-50 backdrop-blur-sm grayscale-[0.2]";
    default: 
      return "opacity-60 saturate-100 backdrop-blur-md";
  }
}
