import { BehavioralState } from '../../athlete/services/behavioralContinuityEngine';
import { WeeklyRhythmState } from '../../athlete/services/weeklyRecoveryRhythmEngine';

export interface AdaptiveEngineInput {
  recoveryScore: number;
  workoutIntensity: 'rest' | 'light' | 'moderate' | 'heavy';
  hydrationAdherence: number; // 0-100
  recentSkippedMeals: number; // count
  regenerationCount: number; // for current slot
  behavioralState?: BehavioralState;
  weeklyRhythm?: WeeklyRhythmState;
  predictiveState?: string;
  autonomousState?: string;
  arbitration?: {
    shouldSimplify: boolean;
    maxRecipeComplexity: number;
    routingStrategy: string;
  };
}

export type TimelineRecommendationMode = 
  | 'recovery-biased'
  | 'protein-priority'
  | 'low-fatigue'
  | 'high-performance'
  | 'digestion-friendly'
  | 'balanced';

export const adaptiveMealTimelineEngine = {
  determineMode(input: AdaptiveEngineInput): TimelineRecommendationMode {
    // AROS Overrides
    if (input.autonomousState === 'simplify' || input.arbitration?.shouldSimplify) {
      return 'low-fatigue';
    }
    if (input.autonomousState === 'recover') {
      return 'recovery-biased';
    }
    if (input.autonomousState === 'optimize') {
      return 'high-performance';
    }
    if (input.autonomousState === 'rebuild') {
      return 'balanced';
    }
    if (input.autonomousState === 'deload') {
      return 'recovery-biased';
    }

    if (input.predictiveState === 'burnout_risk' || input.predictiveState === 'recovery_drift') {
      return 'low-fatigue';
    }
    if (input.weeklyRhythm === 'recovery_deload') {
      return 'recovery-biased';
    }
    if (input.weeklyRhythm === 'progressive_build' && input.recoveryScore >= 70 && input.predictiveState === 'stable_growth') {
      return 'high-performance';
    }
    if (input.weeklyRhythm === 'unstable_rhythm' || input.behavioralState === 'overwhelmed' || input.behavioralState === 'fatigued' || input.behavioralState === 'disengaging') {
      return 'low-fatigue';
    }
    if (input.behavioralState === 'recovering' || input.recoveryScore < 50) {
      return 'recovery-biased';
    }
    if (input.recentSkippedMeals >= 2 || input.regenerationCount >= 2) {
      return 'low-fatigue';
    }
    if (input.workoutIntensity === 'heavy' && input.recoveryScore >= 70) {
      return 'high-performance';
    }
    if (input.hydrationAdherence < 50) {
      return 'digestion-friendly';
    }
    return 'protein-priority';
  },

  getPromptContext(mode: TimelineRecommendationMode): string {
    switch (mode) {
      case 'recovery-biased':
        return 'Focus on anti-inflammatory ingredients, high antioxidants, and easy-to-digest recovery fuels.';
      case 'low-fatigue':
        return 'Keep ingredient lists very short and prep time under 10 minutes. Minimal cooking required. Reduce decision overload.';
      case 'high-performance':
        return 'Prioritize fast-absorbing carbohydrates, balanced mineral content, and performance-sustaining energy.';
      case 'digestion-friendly':
        return 'Use easily digestible cooked vegetables, lean proteins, and avoid heavy fats or very spicy foods.';
      case 'protein-priority':
        return 'Ensure protein sources are highly bioavailable, central to the meal, and support muscle synthesis.';
      case 'balanced':
      default:
        return 'Provide a balanced, nutrient-dense meal using whole foods.';
    }
  }
};
