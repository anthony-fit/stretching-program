import { 
  MealEntry, 
  HydrationLog, 
  CaloriesBurnedEntry,
  NutritionProfile
} from '../../nutrition/types';

export interface RecoveryScoreResult {
  recoveryScore: number;
  hydrationScore: number;
  mobilityScore: number;
  nutritionScore: number;
  readiness: 'High' | 'Moderate' | 'Low';
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

export interface RecoveryState {
  score: RecoveryScoreResult | null;
  isLoading: boolean;
}
