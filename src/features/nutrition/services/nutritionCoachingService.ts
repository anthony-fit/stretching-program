import { NutritionInsightContext } from './buildNutritionInsightContext';
import { RecoveryScoreResult } from '../../recovery/types';
import { AdaptiveAthleteDNA } from '../../athlete-memory/types';
import { safeFetch } from '../../../lib/network/safeFetch';

export interface CoachingInsight {
  message: string;
  type: 'motivation' | 'warning' | 'tip';
  timestamp: number;
}

export const nutritionCoachingService = {
  async getDailyInsight(context: NutritionInsightContext): Promise<CoachingInsight> {
    try {
      const response = await safeFetch<CoachingInsight>('/api/nutrition/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...context, type: 'nutrition' }),
        timeoutMs: 10000,
        retries: 1
      });

      return response;
    } catch (e) {
      console.warn('Coaching failed, using fallback', e);
      return this.getFallbackInsight(context);
    }
  },

  async getRecoveryInsight(recovery: RecoveryScoreResult, dna?: AdaptiveAthleteDNA): Promise<CoachingInsight> {
    try {
      const response = await safeFetch<CoachingInsight>('/api/nutrition/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recovery, type: 'recovery', dna }),
        timeoutMs: 10000,
        retries: 1
      });

      return response;
    } catch (e) {
      console.warn('Recovery coaching failed, using fallback', e);
      return {
        message: recovery.recommendations[0] || "Your system state is " + recovery.readiness + ". Focus on consistent habits for optimal results.",
        type: recovery.readiness === 'Low' ? 'warning' : 'tip',
        timestamp: Date.now()
      };
    }
  },

  getFallbackInsight(context: NutritionInsightContext): CoachingInsight {
    if (context.caloriesRemaining < -200) {
      return {
        message: "You've exceeded your calorie target today. Focus on high-volume, low-calorie vegetables for the rest of the day and ensure you're drinking enough water.",
        type: 'warning',
        timestamp: Date.now()
      };
    }
    
    if (context.hasMetProtein) {
      return {
        message: "Excellent job hitting your protein target! This is crucial for muscle protein synthesis and recovery.",
        type: 'motivation',
        timestamp: Date.now()
      };
    }

    if (!context.hasMetHydration && context.caloriesRemaining > 0) {
      return {
        message: "You're doing well on calories, but don't forget your hydration. Try to reach your target of " + context.hydrationTarget + "L.",
        type: 'tip',
        timestamp: Date.now()
      };
    }

    return {
      message: "Keep maintaining your consistency. Success in nutrition is built on the foundation of small, daily habits.",
      type: 'motivation',
      timestamp: Date.now()
    };
  }
};
