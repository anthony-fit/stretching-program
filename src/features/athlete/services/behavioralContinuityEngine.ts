import { HabitMomentumMetrics } from '../utils/buildHabitMomentum';

export type BehavioralState = 
  | 'highly_consistent'
  | 'fatigued'
  | 'overwhelmed'
  | 'recovering'
  | 'exploratory'
  | 'disengaging';

export interface BehavioralEngineInput {
  momentum: HabitMomentumMetrics;
  recentRegenerations: number;
  recentSkippedMeals: number;
  recentLowRecoveryDays: number;
}

export const behavioralContinuityEngine = {
  detectState(input: BehavioralEngineInput): BehavioralState {
    if (input.recentLowRecoveryDays >= 3 || input.momentum.recoveryDiscipline < 40) {
      return 'fatigued';
    }
    if (input.momentum.overallMomentum === 'At Risk' || input.recentSkippedMeals > 4) {
      return 'disengaging';
    }
    if (input.recentRegenerations > 5 && input.recentSkippedMeals > 2) {
      return 'overwhelmed';
    }
    if (input.momentum.overallMomentum === 'Strong') {
      return input.recentRegenerations > 3 ? 'exploratory' : 'highly_consistent';
    }
    return 'recovering';
  },

  getCoachingContext(state: BehavioralState): string {
    switch (state) {
      case 'highly_consistent':
        return 'Athlete is in high momentum. Keep recommendations challenging and varied.';
      case 'fatigued':
        return 'Athlete is fatigued. Prioritize passive recovery, high-hydration, and ultra-simple meals.';
      case 'overwhelmed':
        return 'Athlete is overwhelmed by choices. Dramatically reduce complexity, recommend familiar items, minimize decisions.';
      case 'disengaging':
        return 'Athlete is at risk of falling off. Suggest micro-habits, 2-minute actions, and celebrate tiny wins.';
      case 'exploratory':
        return 'Athlete is consistent but seeking variety. Introduce novel cuisines and diverse ingredients.';
      case 'recovering':
      default:
        return 'Athlete is building consistency. Maintain a steady, encouraging tone with balanced recommendations.';
    }
  }
};
