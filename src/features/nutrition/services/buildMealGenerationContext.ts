import { MealEntry, NutritionProfile, HydrationLog, CaloriesBurnedEntry } from '../types';
import { buildNutritionInsightContext } from './buildNutritionInsightContext';

export interface MealGenerationOptions {
  dietType?: string;
  allergies?: string[];
  preferredFoods?: string[];
  availableIngredients?: string[];
  cookingTimeTarget?: number; // minutes
  budgetLevel?: 'low' | 'medium' | 'high';
  sessionIntensity?: 'low' | 'moderate' | 'high';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'recovery';
}

export interface MealGenerationContext {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  recoveryState: 'low' | 'optimal' | 'high_fatigue';
  profile: NutritionProfile;
  options: MealGenerationOptions;
}

export function buildMealGenerationContext(
  profile: NutritionProfile,
  meals: MealEntry[],
  hydration: HydrationLog[],
  activity: CaloriesBurnedEntry[],
  options: MealGenerationOptions = {}
): MealGenerationContext {
  const insightContext = buildNutritionInsightContext(profile, meals, hydration, activity);

  const remainingProtein = Math.max(0, insightContext.proteinTarget - insightContext.proteinConsumed);
  const remainingCarbs = Math.max(0, insightContext.carbsTarget - insightContext.carbsConsumed);
  const remainingFat = Math.max(0, insightContext.fatTarget - insightContext.fatConsumed);

  // Simple recovery heuristic
  let recoveryState: 'low' | 'optimal' | 'high_fatigue' = 'optimal';
  if (insightContext.netCalories < insightContext.caloriesTarget * 0.8 || insightContext.hydrationPercent < 50) {
    recoveryState = 'high_fatigue';
  } else if (insightContext.netCalories > insightContext.caloriesTarget * 1.2) {
    recoveryState = 'low';
  }

  return {
    remainingCalories: insightContext.caloriesRemaining,
    remainingProtein,
    remainingCarbs,
    remainingFat,
    recoveryState,
    profile,
    options
  };
}
