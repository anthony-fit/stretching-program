import { RecoveryScoreResult } from '../../recovery/types';
import { MealEntry, HydrationLog, CaloriesBurnedEntry, NutritionProfile } from '../../nutrition/types';

export interface AthleteStreak {
  hydrationCount: number;
  mobilityCount: number;
  nutritionLogCount: number;
  recoveryCheckInCount: number;
  lastUpdated: string; // ISO date
}

export interface AthleteRecommendation {
  readiness: number;
  recommendedFocus: 'Recovery' | 'Maintenance' | 'Performance';
  suggestedDuration: number; // minutes
  mobilityRecommendation: string;
  nutritionPriority: string;
  recoveryPriority: string;
  warnings: string[];
}

export interface DailyAthleteFlow {
  date: string;
  readiness: RecoveryScoreResult | null;
  recommendation: AthleteRecommendation;
  streaks: AthleteStreak;
}
