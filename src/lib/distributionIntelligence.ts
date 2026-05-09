export type PlatformContext = "tiktok" | "youtube" | "instagram" | "web_app" | "silent_autoplay";
export type ViewingEnvironment = "morning_activation" | "nighttime_recovery" | "gym_display" | "personal_coaching";

export interface AudienceContext {
  platform: PlatformContext;
  viewingEnvironment: ViewingEnvironment;
  soundAvailability: "muted" | "headphones" | "speakers";
}

export interface DistributionConstraints {
  recommendedSubtitleMode: "accessibility_forward" | "editorial_cinematic" | "ultra_minimal" | "nighttime_low_pressure";
  hookStyle: "energetic_activation" | "calming_reassurance" | "authority_framing" | "movement_curiosity" | "reflective_opening";
  maxInitialSceneDuration: number;
  allowedPacingArcs: string[];
}

export function evaluateDistributionContext(context: AudienceContext): DistributionConstraints {
  let recommendedSubtitleMode: DistributionConstraints["recommendedSubtitleMode"] = "editorial_cinematic";
  let hookStyle: DistributionConstraints["hookStyle"] = "movement_curiosity";
  let maxInitialSceneDuration = 12;
  let allowedPacingArcs = ["steady", "build-up", "waves", "intervals", "cool-down"];

  if (context.platform === "tiktok" || context.platform === "instagram") {
    maxInitialSceneDuration = 6;
    if (context.viewingEnvironment !== "nighttime_recovery") {
      hookStyle = "energetic_activation";
    }
  } else if (context.platform === "youtube") {
    maxInitialSceneDuration = 15;
    hookStyle = "authority_framing";
  } else if (context.platform === "silent_autoplay") {
    maxInitialSceneDuration = 8;
    recommendedSubtitleMode = "accessibility_forward";
  }

  if (context.soundAvailability === "muted" || context.platform === "silent_autoplay") {
    recommendedSubtitleMode = "accessibility_forward";
  }

  if (context.viewingEnvironment === "nighttime_recovery") {
    hookStyle = "calming_reassurance";
    recommendedSubtitleMode = "nighttime_low_pressure";
    allowedPacingArcs = ["cool-down", "steady"];
  } else if (context.viewingEnvironment === "morning_activation") {
    hookStyle = "energetic_activation";
    allowedPacingArcs = ["build-up", "waves"];
  }

  return {
    recommendedSubtitleMode,
    hookStyle,
    maxInitialSceneDuration,
    allowedPacingArcs
  };
}
