import { nutritionPersistenceService } from '../../nutrition/services/nutritionPersistenceService';
import { calculateRecoveryScore } from '../calculators/calculateRecoveryScore';
import { RecoveryScoreResult } from '../types';
import { WorkoutReport } from '../../../lib/reports';

export const recoveryInsightService = {
  async getReadinessState(): Promise<RecoveryScoreResult | null> {
    try {
      const profile = await nutritionPersistenceService.getProfileState();
      if (!profile.profile) return null;

      const meals = await nutritionPersistenceService.getMeals();
      const hydration = await nutritionPersistenceService.getHydrationLogs();
      const activity = await nutritionPersistenceService.getCaloriesBurnedHistory();
      
      // Get reports from localStorage (standard location for this app)
      const savedReports = localStorage.getItem('workout_reports_v1');
      const reports: WorkoutReport[] = savedReports ? JSON.parse(savedReports) : [];

      return calculateRecoveryScore(
        profile.profile,
        meals,
        hydration,
        activity,
        reports
      );
    } catch (error) {
      console.error('Failed to calculate recovery state:', error);
      return null;
    }
  }
};
