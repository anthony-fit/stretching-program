import { nutritionPersistenceService } from '../../nutrition/services/nutritionPersistenceService';
import { recoveryInsightService } from '../../recovery/services/recoveryInsightService';
import { streakEngine } from './streakEngine';
import { buildDailyAthleteFlow } from './buildDailyAthleteFlow';
import { DailyAthleteFlow, AthleteRecommendation } from '../types';
import { nutritionCoachingService, CoachingInsight } from '../../nutrition/services/nutritionCoachingService';

export const athleteAthleteService = {
  async getUnifiedDashboardData(): Promise<DailyAthleteFlow | null> {
    try {
      const recovery = await recoveryInsightService.getReadinessState();
      const streaks = streakEngine.getStreaks();
      const recommendation = buildDailyAthleteFlow(recovery, streaks, {
        hydrationProgress: 1,
        calorieBalance: 0,
        activityLevel: 'Medium'
      });
      
      return {
        date: new Date().toISOString(),
        readiness: recovery,
        recommendation,
        streaks
      };
    } catch (e) {
      console.error('Failed to get unified athlete data', e);
      return null;
    }
  },

  async getUnifiedCoachInsight(data: DailyAthleteFlow): Promise<CoachingInsight> {
    // We'll use the recovery insight service as the primary unified bridge for now
    // but we can pass more context if we update the backend
    if (!data.readiness) {
       return {
         message: "Initialize your bio-profile to receive elite coaching insights.",
         type: 'tip',
         timestamp: Date.now()
       };
    }
    return nutritionCoachingService.getRecoveryInsight(data.readiness);
  }
};
