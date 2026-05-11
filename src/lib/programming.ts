import { WorkoutReport } from "./reports";

export type ProgramPhase = "Foundation" | "Building" | "Peak" | "Recovery";

export interface ProgramPhaseConfig {
  name: string;
  type: ProgramPhase;
  durationWeeks: number;
  intensityTarget: "Low" | "Medium" | "High";
  priorityFocus: string[]; // e.g., ['Mobility', 'Core']
}

export interface Program {
  id: string;
  name: string;
  description: string;
  phases: ProgramPhaseConfig[];
  currentPhaseIndex: number;
  startDate: string;
}

export interface CoachingAchievement {
  id: string;
  title: string;
  description: string;
  dateAttained: string;
  category: "Consistency" | "Phase" | "Focus" | "Recovery";
}

export interface GoalJourney {
  id: string;
  name: string;
  focus: string;
  coachingTone: "Supportive" | "Technical" | "Disciplined" | "Direct";
  pacingStyle: "Progressive" | "Steady" | "Restorative";
  recoveryWeighting: number; // 0-1
  movementEmphasis: string[];
  milestones: JourneyMilestone[];
  description: string;
}

export interface JourneyMilestone {
  id: string;
  label: string;
  workoutRequirement: number;
  description: string;
}

export interface TransformationNarrative {
  title: string;
  message: string;
  highlight: string;
}

export type TransformationThemeId =
  | "journey-update"
  | "recovery-reflection"
  | "mobility-milestone"
  | "performance-shift"
  | "daily-ritual"
  | "coach-insight"
  | "phase-transition";

export interface TransformationTheme {
  id: TransformationThemeId;
  label: string;
  description: string;
  hookPrefix: string;
  narrativeFocus: string;
}

export const TRANSFORMATION_THEMES: TransformationTheme[] = [
  {
    id: "journey-update",
    label: "Journey Update",
    description: "Log progress on your long-term goal journey.",
    hookPrefix: "JOURNEY UPDATE:",
    narrativeFocus: "progress over time and consistency",
  },
  {
    id: "recovery-reflection",
    label: "Recovery Reflection",
    description: "Focus on how the body is responding to restorative movement.",
    hookPrefix: "RECOVERY LOG:",
    narrativeFocus: "nervous system calm and pain relief",
  },
  {
    id: "mobility-milestone",
    label: "Mobility Milestone",
    description: "Celebrate reaching a specific joint health or range goal.",
    hookPrefix: "MILESTONE UNLOCKED:",
    narrativeFocus: "new range of motion and technical mastery",
  },
  {
    id: "performance-shift",
    label: "Performance Shift",
    description: "Highlight improved power, stability or endurance.",
    hookPrefix: "PERFORMANCE SHIFT:",
    narrativeFocus: "athletic capability and output capacity",
  },
  {
    id: "daily-ritual",
    label: "Daily Ritual",
    description: "The power of small, consistent movement snacks.",
    hookPrefix: "DAILY RITUAL:",
    narrativeFocus: "habit building and discipline",
  },
  {
    id: "coach-insight",
    label: "Coach Insight",
    description: "Share specific technical cues and wisdom from your coach.",
    hookPrefix: "COACH INSIGHT:",
    narrativeFocus: "technical mastery and expert advice",
  },
  {
    id: "phase-transition",
    label: "Phase Transition",
    description: "Moving from foundation to peak performance.",
    hookPrefix: "PHASE COMPLETE:",
    narrativeFocus: "evolution of the program and next steps",
  },
];

export interface UserProgression {
  currentProgramId?: string;
  currentJourneyId?: string;
  completedWorkoutCount: number;
  consistencyStreak: number;
  lastWorkoutDate?: string;
  muscleFatigueLevels: Record<string, number>; // 0-100
  recentIntensityExposure: number[]; // Last 5 sessions (1-10)
  mobilityEvolution: Record<string, number[]>; // e.g. { 'Ankle': [60, 65, 70] }
  momentumScore: number; // 0-100
  achievements: CoachingAchievement[];
}

export const GOAL_JOURNEYS: GoalJourney[] = [
  {
    id: "mobility-reset",
    name: "Mobility Reset",
    focus: "Range of Motion Restoration",
    coachingTone: "Supportive",
    pacingStyle: "Restorative",
    recoveryWeighting: 0.8,
    movementEmphasis: ["Spine", "Hips", "Shoulders"],
    description:
      "Restore foundational movement capacity and alleviate chronic stiffness.",
    milestones: [
      {
        id: "m1",
        label: "Pattern Initiation",
        workoutRequirement: 3,
        description: "Stabilized basic decompression movement patterns.",
      },
      {
        id: "m2",
        label: "Joint Freedom",
        workoutRequirement: 8,
        description: "Measurable expansion in hip and shoulder articulation.",
      },
      {
        id: "m3",
        label: "Mobility Mastery",
        workoutRequirement: 15,
        description: "Full integration of restorative movement habits.",
      },
    ],
  },
  {
    id: "posture-recovery",
    name: "Posture Recovery",
    focus: "Structural Alignment",
    coachingTone: "Technical",
    pacingStyle: "Steady",
    recoveryWeighting: 0.6,
    movementEmphasis: ["Thoracic", "Neck", "Glutes"],
    description:
      "Counteract the effects of prolonged sitting and restore natural alignment.",
    milestones: [
      {
        id: "p1",
        label: "Alignment Awareness",
        workoutRequirement: 4,
        description: "Improved proprioception of neutral spine position.",
      },
      {
        id: "p2",
        label: "Posterior Activation",
        workoutRequirement: 10,
        description: "Strengthened core and glute support systems.",
      },
      {
        id: "p3",
        label: "Structural Resilience",
        workoutRequirement: 20,
        description:
          "Natural posture maintained through long-duration sitting.",
      },
    ],
  },
  {
    id: "movement-restoration",
    name: "Movement Restoration",
    focus: "Functional Integration",
    coachingTone: "Supportive",
    pacingStyle: "Progressive",
    recoveryWeighting: 0.5,
    movementEmphasis: ["Multi-planar", "Balance", "Control"],
    description:
      "Rebuild the bridge between isolated stretching and dynamic functional movement.",
    milestones: [
      {
        id: "r1",
        label: "Multi-planar Stability",
        workoutRequirement: 5,
        description: "Controlled movement through all ranges of motion.",
      },
      {
        id: "r2",
        label: "Balance Threshold",
        workoutRequirement: 12,
        description: "Significantly improved unilateral stability.",
      },
    ],
  },
  {
    id: "performance-foundation",
    name: "Performance Foundation",
    focus: "Power & Output capacity",
    coachingTone: "Disciplined",
    pacingStyle: "Progressive",
    recoveryWeighting: 0.3,
    movementEmphasis: ["Explosive", "Force Production", "Plyo"],
    description:
      "Prepare the musculoskeletal system for higher intensity training loads.",
    milestones: [
      {
        id: "pf1",
        label: "Elastic Efficiency",
        workoutRequirement: 6,
        description: "Improved force absorption and rebound capacity.",
      },
    ],
  },
  {
    id: "desk-recovery",
    name: "Desk Recovery",
    focus: "Sedentary Counter-action",
    coachingTone: "Direct",
    pacingStyle: "Steady",
    recoveryWeighting: 0.7,
    movementEmphasis: ["Hip Flexors", "Chest", "Sub-occipitals"],
    description:
      "Targeted relief for the specific strains of modern desk-based work.",
    milestones: [
      {
        id: "d1",
        label: "Daily Decompression",
        workoutRequirement: 2,
        description: "Established a consistent daily relief rhythm.",
      },
    ],
  },
];

export interface ReadinessScore {
  score: number; // 0-100
  reason: string;
  recommendation: "Push" | "Maintain" | "Recover";
  insights: MovementInsight[];
}

export interface MovementInsight {
  label: string;
  value: number | string;
  status: "optimal" | "balanced" | "strained" | "improving";
  interpretation: string;
  icon?: string;
}

export const PRESET_PROGRAMS: Program[] = [
  {
    id: "mobility-reset",
    name: "Mobility Reset",
    description: "A 4-week program to restore range of motion and fix posture.",
    phases: [
      {
        name: "Decompress",
        type: "Foundation",
        durationWeeks: 1,
        intensityTarget: "Low",
        priorityFocus: ["Spine", "Breathing"],
      },
      {
        name: "Activate",
        type: "Foundation",
        durationWeeks: 1,
        intensityTarget: "Low",
        priorityFocus: ["Hips", "Glutes"],
      },
      {
        name: "Integrate",
        type: "Building",
        durationWeeks: 2,
        intensityTarget: "Medium",
        priorityFocus: ["Full Body Control"],
      },
    ],
    currentPhaseIndex: 0,
    startDate: new Date().toISOString(),
  },
  {
    id: "strength-foundation",
    name: "Strength Foundation",
    description: "Learn fundamental movements and build initial muscle mass.",
    phases: [
      {
        name: "Technique",
        type: "Foundation",
        durationWeeks: 2,
        intensityTarget: "Medium",
        priorityFocus: ["Form", "Stability"],
      },
      {
        name: "Volume Build",
        type: "Building",
        durationWeeks: 2,
        intensityTarget: "Medium",
        priorityFocus: ["Hypertrophy"],
      },
      {
        name: "Intensity Peak",
        type: "Peak",
        durationWeeks: 2,
        intensityTarget: "High",
        priorityFocus: ["Power"],
      },
    ],
    currentPhaseIndex: 0,
    startDate: new Date().toISOString(),
  },
];

export interface DailyInspiration {
  focus: string;
  ritualType: "Mobility" | "Recovery" | "Activation";
  message: string;
}

export function getDailyInspiration(
  progression: UserProgression,
  readiness: ReadinessScore,
): DailyInspiration {
  if (readiness.score < 60) {
    return {
      focus: "System Restoration",
      ritualType: "Recovery",
      message:
        "Your physiological markers suggest a restorative approach. Prioritizing nervous system down-regulation today.",
    };
  }

  if (progression.momentumScore > 80) {
    return {
      focus: "Performance Flow",
      ritualType: "Mobility",
      message:
        "Momentum is peak. Focusing on structural integrity to support your increased training volume.",
    };
  }

  return {
    focus: "Functional Baseline",
    ritualType: "Activation",
    message:
      "Maintaining the rhythm. High-quality movement today keeps the momentum building.",
  };
}

export function calculateReadiness(
  progression: UserProgression,
): ReadinessScore {
  const avgIntensity =
    progression.recentIntensityExposure.length > 0
      ? progression.recentIntensityExposure.reduce((a, b) => a + b, 0) /
        progression.recentIntensityExposure.length
      : 0;

  // Baseline
  let score = 85;

  // Fatigue logic (Professional Interpretation)
  let loadStatus: "optimal" | "balanced" | "strained" | "improving" = "optimal";
  if (avgIntensity > 7 && progression.consistencyStreak >= 3) {
    score -= 25;
    loadStatus = "strained";
  } else if (avgIntensity > 0) {
    loadStatus = "balanced";
  }

  // Inactivity penalty
  if (
    progression.consistencyStreak === 0 &&
    progression.completedWorkoutCount > 0
  ) {
    score -= 20;
  }

  // Momentum bonus
  if (progression.momentumScore > 80) {
    score = Math.min(100, score + 10);
  }

  // Derive Professional Insights
  const insights: MovementInsight[] = [
    {
      label: "Recovery Capacity",
      value: `${score}%`,
      status: score > 75 ? "optimal" : score > 50 ? "balanced" : "strained",
      interpretation:
        score > 75
          ? "System responding well to current load. Movement readiness is high."
          : score > 50
            ? "Movement loading is balanced. Moderate recovery capacity."
            : "Restoration-focused pacing recommended. Movement markers indicate fatigue.",
    },
    {
      label: "Training Load",
      value: loadStatus.charAt(0).toUpperCase() + loadStatus.slice(1),
      status: loadStatus,
      interpretation:
        loadStatus === "strained"
          ? "Current intensity exceeds optimal movement window."
          : loadStatus === "optimal"
            ? "Load profile supports sustainable movement habits."
            : "Maintaining movement baseline.",
    },
    {
      label: "Movement Stability",
      value: progression.completedWorkoutCount > 10 ? "Stable" : "Building",
      status: progression.completedWorkoutCount > 10 ? "optimal" : "improving",
      interpretation:
        progression.completedWorkoutCount > 10
          ? "Movement patterns are well-established."
          : "Patterns are currently in the integration phase.",
    },
    {
      label: "Mobility Balance",
      value: "74%",
      status: "balanced",
      interpretation: "Movement symmetry is within expected range.",
    },
  ];

  if (score < 50) {
    return {
      score,
      reason: "High fatigue accumulation detected. Recovery prioritized.",
      recommendation: "Recover",
      insights,
    };
  }

  if (score < 75) {
    return {
      score,
      reason: "System loading is balanced.",
      recommendation: "Maintain",
      insights,
    };
  }

  return {
    score,
    reason: "Body is highly responsive to training load.",
    recommendation: "Push",
    insights,
  };
}

export function getTransformationNarrative(
  progression: UserProgression,
  journey: GoalJourney,
): TransformationNarrative {
  const milestone = [...journey.milestones]
    .reverse()
    .find((m) => progression.completedWorkoutCount >= m.workoutRequirement);

  if (!milestone) {
    return {
      title: "Journey Initiation",
      message: `You are in the foundation phase of ${journey.name}. Focusing on ${journey.focus} to build structural readiness.`,
      highlight: "Establish Consistency",
    };
  }

  const nextMilestone = journey.milestones.find(
    (m) => m.workoutRequirement > progression.completedWorkoutCount,
  );

  return {
    title: milestone.label,
    message:
      milestone.description +
      (nextMilestone ? ` Progressing toward ${nextMilestone.label}.` : ""),
    highlight: nextMilestone
      ? `${nextMilestone.workoutRequirement - progression.completedWorkoutCount} sessions to next level`
      : "Journey Mastery Reached",
  };
}

export function getProgressionFromReports(
  reports: WorkoutReport[],
): UserProgression {
  const lastWorkout = reports.length > 0 ? reports[reports.length - 1] : null;

  // Calculate streak
  let streak = 0;
  if (lastWorkout) {
    const today = new Date();
    const lastDate = new Date(lastWorkout.date);
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24),
    );

    if (diffDays <= 2) {
      // 2 day grace period for streak
      streak = reports.length > 5 ? 5 : reports.length; // Simplified streak logic
    }
  }

  // Calculate momentum (frequency + variety)
  const momentum = Math.min(100, reports.length * 5 + streak * 10);

  // Determine achievements
  const achievements: CoachingAchievement[] = [];
  if (reports.length >= 1)
    achievements.push({
      id: "first-session",
      title: "First Step",
      description: "Initiated the coaching journey.",
      dateAttained: reports[0].date,
      category: "Phase",
    });
  if (reports.length >= 5)
    achievements.push({
      id: "consistency-5",
      title: "Momentum Builder",
      description: "Completed 5 sessions with discipline.",
      dateAttained: reports[4].date,
      category: "Consistency",
    });

  return {
    completedWorkoutCount: reports.length,
    consistencyStreak: streak,
    lastWorkoutDate: lastWorkout?.date,
    muscleFatigueLevels: {},
    recentIntensityExposure: reports.slice(-5).map((r) => r.perceivedExertion),
    mobilityEvolution: {},
    momentumScore: momentum,
    achievements,
  };
}
