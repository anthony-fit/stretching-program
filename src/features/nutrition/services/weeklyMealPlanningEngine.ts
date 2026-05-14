import { WeeklyRhythmState } from '../../athlete/services/weeklyRecoveryRhythmEngine';

export interface WeeklyNutritionEmphasis {
  primaryGoal: 'recovery' | 'performance' | 'simplicity' | 'balance' | 'protein-loading';
  prepComplexityTarget: 'low' | 'moderate' | 'high';
  caloricAdjustment: 'maintenance' | 'slight_surplus' | 'slight_deficit';
}

export const weeklyMealPlanningEngine = {
  determineEmphasis(rhythm: WeeklyRhythmState, avgRecovery: number): WeeklyNutritionEmphasis {
    switch(rhythm) {
      case 'progressive_build':
        return {
          primaryGoal: 'performance',
          prepComplexityTarget: 'moderate',
          caloricAdjustment: 'slight_surplus'
        };
      case 'recovery_deload':
        return {
          primaryGoal: 'recovery',
          prepComplexityTarget: 'low',
          caloricAdjustment: 'maintenance'
        };
      case 'unstable_rhythm':
        return {
          primaryGoal: 'simplicity',
          prepComplexityTarget: 'low',
          caloricAdjustment: 'maintenance'
        };
      case 'rebound_phase':
        return {
          primaryGoal: 'protein-loading',
          prepComplexityTarget: 'moderate',
          caloricAdjustment: 'maintenance'
        };
      case 'maintenance':
      default:
        return {
          primaryGoal: avgRecovery < 60 ? 'recovery' : 'balance',
          prepComplexityTarget: 'moderate',
          caloricAdjustment: 'maintenance'
        };
    }
  }
};
