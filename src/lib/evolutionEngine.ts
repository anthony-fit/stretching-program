import { EditorialReflection } from "./creativeCritique";

export type MicroEvolutionDirection =
  | "extend_silence_windows"
  | "soften_transition_asymmetry"
  | "delay_emotional_peaks"
  | "reduce_subtitle_dependency"
  | "alternate_recovery_pacing"
  | "subtler_soundtrack_decay"
  | "new_cadence_spacing"
  | "restrained_subtitle_fades";

export interface EvolutionaryStability {
  status: "stagnating" | "evolving" | "stabilized" | "chaotic";
  maturityScore: number;
  readinessForEvolution: boolean;
}

export interface EmergentMotif {
  description: string;
  confidence: number;
}

export interface SystemEvolutionState {
  stability: EvolutionaryStability;
  proposedEvolutions: MicroEvolutionDirection[];
  emergentMotifs: EmergentMotif[];
}

export function evaluateEvolutionaryStability(
  reflections: EditorialReflection[],
): EvolutionaryStability {
  if (reflections.length < 4) {
    return {
      status: "evolving",
      maturityScore: 50,
      readinessForEvolution: false,
    };
  }

  const recent = reflections.slice(-4);
  const avgConfidence =
    recent.reduce((sum, r) => sum + r.confidence.overallConfidence, 0) /
    recent.length;
  const avgOriginality =
    recent.reduce((sum, r) => sum + r.confidence.originalityConfidence, 0) /
    recent.length;

  // Creative Identity Stabilization Curves
  if (avgConfidence > 82 && avgOriginality > 70) {
    // High maturity, no need to force evolution. The system intentionally stabilizes.
    return {
      status: "stabilized",
      maturityScore: 95,
      readinessForEvolution: false,
    };
  }

  if (avgOriginality < 45) {
    // Needs evolution due to repetition
    return {
      status: "stagnating",
      maturityScore: 60,
      readinessForEvolution: true,
    };
  }

  if (avgConfidence < 55) {
    // Needs grounding, not evolution
    return {
      status: "chaotic",
      maturityScore: 35,
      readinessForEvolution: false,
    };
  }

  return { status: "evolving", maturityScore: 75, readinessForEvolution: true };
}

export function discoverEmergentMotifs(
  reflections: EditorialReflection[],
): EmergentMotif[] {
  // Cross-Layer Evolution Observation & Emergent Motif Discovery
  const motifs: EmergentMotif[] = [];

  const highScoring = reflections.filter(
    (r) => r.confidence.overallConfidence > 80,
  );

  if (highScoring.length >= 2) {
    const avgSilenceInt =
      highScoring.reduce(
        (sum, r) => sum + r.critique.silenceIntentionality,
        0,
      ) / highScoring.length;
    if (avgSilenceInt > 85) {
      motifs.push({
        description: "recurring_silence_before_resolution",
        confidence: avgSilenceInt,
      });
    }

    const avgRecovery =
      highScoring.reduce((sum, r) => sum + r.critique.recoveryIntelligence, 0) /
      highScoring.length;
    if (avgRecovery > 80) {
      motifs.push({
        description: "progressive_emotional_decompression",
        confidence: avgRecovery,
      });
    }

    const avgSubtitleRestraint =
      highScoring.reduce((sum, r) => sum + r.critique.subtitleRestraint, 0) /
      highScoring.length;
    if (avgSubtitleRestraint > 85) {
      motifs.push({
        description: "delayed_motivational_emergence",
        confidence: avgSubtitleRestraint,
      });
    }
  }

  return motifs;
}

export function proposeMicroEvolutions(
  stability: EvolutionaryStability,
  motifs: EmergentMotif[],
): MicroEvolutionDirection[] {
  const directions: MicroEvolutionDirection[] = [];

  if (!stability.readinessForEvolution) {
    return directions; // Enforce stabilization
  }

  if (stability.status === "stagnating") {
    directions.push("alternate_recovery_pacing");
    directions.push("delay_emotional_peaks");
  } else if (stability.status === "evolving") {
    if (
      motifs.find(
        (m) => m.description === "recurring_silence_before_resolution",
      )
    ) {
      directions.push("extend_silence_windows");
    } else {
      directions.push("subtler_soundtrack_decay");
    }
    if (
      motifs.find((m) => m.description === "delayed_motivational_emergence")
    ) {
      directions.push("restrained_subtitle_fades");
    }
  }

  return directions;
}

export function getEvolutionState(
  pastReflections: EditorialReflection[],
): SystemEvolutionState {
  const stability = evaluateEvolutionaryStability(pastReflections);
  const emergentMotifs = discoverEmergentMotifs(pastReflections);
  const proposedEvolutions = proposeMicroEvolutions(stability, emergentMotifs);

  return {
    stability,
    emergentMotifs,
    proposedEvolutions,
  };
}

const TEMPORAL_LOG_KEY = "stretchingpro_temporal_evolution_log";

export function logTemporalEvolution(state: SystemEvolutionState) {
  try {
    const raw = localStorage.getItem(TEMPORAL_LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];

    logs.push({
      timestamp: Date.now(),
      status: state.stability.status,
      maturity: state.stability.maturityScore,
      motifsCount: state.emergentMotifs.length,
      evolutionsCount: state.proposedEvolutions.length,
    });

    localStorage.setItem(TEMPORAL_LOG_KEY, JSON.stringify(logs));
  } catch (e) {}
}
