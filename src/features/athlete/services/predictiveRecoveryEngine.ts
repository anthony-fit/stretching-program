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

export interface PredictiveStatus {
  state: PredictiveRecoveryState;
  burnoutPressure: 'low' | 'moderate' | 'high';
  stabilityWindow: string;
}

export const predictiveRecoveryEngine = {
  detectState(input: PredictiveEngineInput): PredictiveRecoveryState {
    const status = this.analyze(input);
    return status.state;
  },

  analyze(input: PredictiveEngineInput): PredictiveStatus {
    if (input.historyDays < 7) {
      return { 
        state: 'stable_growth', 
        burnoutPressure: 'low', 
        stabilityWindow: 'Initial baseline' 
      };
    }

    let riskFactors = 0;
    if (input.recentSkippedMeals > 3) riskFactors++;
    if (input.hydrationInconsistency > 3) riskFactors++;
    if (input.lowRecoveryStreaks > 1) riskFactors++;
    if (input.excessiveRegenerations > 10) riskFactors++;
    if (input.mobilityDropoff) riskFactors += 2;
    if (input.decliningCompletion) riskFactors += 2;

    let state: PredictiveRecoveryState = 'rebound_recovery';
    let pressure: 'low' | 'moderate' | 'high' = 'low';
    
    if (riskFactors >= 5) {
      state = 'burnout_risk';
      pressure = 'high';
    } else if (riskFactors >= 3) {
      state = 'recovery_drift';
      pressure = 'moderate';
    } else if (riskFactors >= 1 && input.decliningCompletion) {
      state = 'inconsistent_cycle';
      pressure = 'low';
    } else if (input.lowRecoveryStreaks === 0 && riskFactors <= 1 && input.recentSkippedMeals === 0) {
      state = 'stable_growth';
      pressure = 'low';
    }

    const window = input.decliningCompletion || input.mobilityDropoff 
      ? 'Declining (48h trend)' 
      : (riskFactors === 0 ? 'Optimal (14-day stable)' : 'Mixed stability');

    return {
      state,
      burnoutPressure: pressure,
      stabilityWindow: window
    };
  }
};
