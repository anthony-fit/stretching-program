export type PredictiveRecoveryState = 
  | 'stable_growth'
  | 'recovery_drift'
  | 'burnout_risk'
  | 'rebound_recovery'
  | 'inconsistent_cycle';

export interface PredictiveEngineInput {
  historyDays: number;
  recentSkippedMeals: number; // last 7-14 days
  hydrationInconsistency: number; // days missed target in last 14
  lowRecoveryStreaks: number; // consecutive days < 50
  excessiveRegenerations: number; // count over last 14 days
  mobilityDropoff: boolean; // recent week vs previous week
  decliningCompletion: boolean; // recent week vs previous week
}

export const predictiveRecoveryEngine = {
  detectState(input: PredictiveEngineInput): PredictiveRecoveryState {
    if (input.historyDays < 7) return 'stable_growth';

    let riskFactors = 0;
    if (input.recentSkippedMeals > 3) riskFactors++;
    if (input.hydrationInconsistency > 3) riskFactors++;
    if (input.lowRecoveryStreaks > 1) riskFactors++;
    if (input.excessiveRegenerations > 10) riskFactors++;
    if (input.mobilityDropoff) riskFactors += 2;
    if (input.decliningCompletion) riskFactors += 2;

    if (riskFactors >= 5) {
      return 'burnout_risk';
    }

    if (riskFactors >= 3) {
      return 'recovery_drift';
    }

    if (riskFactors >= 1 && input.decliningCompletion) {
       return 'inconsistent_cycle';
    }

    if (input.lowRecoveryStreaks === 0 && riskFactors <= 1 && input.recentSkippedMeals === 0) {
       return 'stable_growth';
    }

    return 'rebound_recovery';
  }
};
