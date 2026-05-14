export type WeeklyRhythmState = 
  | 'progressive_build'
  | 'maintenance'
  | 'recovery_deload'
  | 'unstable_rhythm'
  | 'rebound_phase';

export interface WeeklyRhythmInput {
  historyDays: number;
  avgMobilityAdherence: number; // 0-100
  avgHydrationConsistency: number; // 0-100
  avgMealCompletion: number; // 0-100
  avgRecoveryScore: number; // 0-100
  burnoutIndicators: number; // count of skipped or overwhelmed days
  regenerationFrequency: number; // count of timeline regenerations per week
}

export const weeklyRecoveryRhythmEngine = {
  detectRhythm(input: WeeklyRhythmInput): WeeklyRhythmState {
    if (input.historyDays < 3) return 'maintenance';

    if (input.burnoutIndicators >= 3 || input.avgMealCompletion < 50) {
      return 'unstable_rhythm';
    }

    if (input.avgRecoveryScore < 50 || input.regenerationFrequency > 10) {
      return 'recovery_deload';
    }

    if (input.avgRecoveryScore > 80 && input.avgMobilityAdherence > 80 && input.avgMealCompletion > 80) {
      return 'progressive_build';
    }

    if (input.burnoutIndicators > 0 && input.avgRecoveryScore > 65 && input.avgMealCompletion > 65) {
      return 'rebound_phase';
    }

    return 'maintenance';
  }
};
