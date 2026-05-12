import { 
  MealEntry, 
  HydrationLog, 
  CaloriesBurnedEntry, 
  NutritionProfile 
} from '../types';

export interface NutritionInsightContext {
  caloriesConsumed: number;
  caloriesTarget: number;
  caloriesRemaining: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  hydrationLiters: number;
  hydrationTarget: number;
  hydrationPercent: number;
  caloriesBurned: number;
  netCalories: number;
  goal: string;
  activityLevel: string;
  hasMetProtein: boolean;
  hasMetHydration: boolean;
  streakDays: number;
}

export function buildNutritionInsightContext(
  profile: NutritionProfile,
  meals: MealEntry[],
  hydration: HydrationLog[],
  activity: CaloriesBurnedEntry[]
): NutritionInsightContext {
  const today = new Date().toDateString();

  const dailyMeals = meals.filter(m => new Date(m.timestamp).toDateString() === today);
  const dailyHydration = hydration.filter(h => new Date(h.timestamp).toDateString() === today);
  const dailyActivity = activity.filter(a => new Date(a.timestamp).toDateString() === today);

  const caloriesConsumed = Math.round(dailyMeals.reduce((sum, m) => sum + m.calories, 0));
  const proteinConsumed = Math.round(dailyMeals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
  const carbsConsumed = Math.round(dailyMeals.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10;
  const fatConsumed = Math.round(dailyMeals.reduce((sum, m) => sum + m.fat, 0) * 10) / 10;
  
  const hydrationLiters = Math.round(dailyHydration.reduce((sum, h) => sum + h.amountLiters, 0) * 10) / 10;
  const caloriesBurned = Math.round(dailyActivity.reduce((sum, a) => sum + a.calories, 0));

  const caloriesTarget = profile.targets.calories;
  const netCalories = caloriesConsumed - caloriesBurned;
  const caloriesRemaining = caloriesTarget - netCalories;

  const hydrationPercent = Math.min(Math.round((hydrationLiters / profile.hydrationTarget) * 100), 100);

  return {
    caloriesConsumed,
    caloriesTarget: Math.round(caloriesTarget),
    caloriesRemaining: Math.round(caloriesRemaining),
    proteinTarget: profile.targets.protein,
    proteinConsumed,
    carbsTarget: profile.targets.carbs,
    carbsConsumed,
    fatTarget: profile.targets.fat,
    fatConsumed,
    hydrationLiters,
    hydrationTarget: profile.hydrationTarget,
    hydrationPercent,
    caloriesBurned,
    netCalories,
    goal: profile.goal,
    activityLevel: profile.activityLevel,
    hasMetProtein: proteinConsumed >= profile.targets.protein,
    hasMetHydration: hydrationLiters >= profile.hydrationTarget,
    streakDays: 1 // Placeholder for now
  };
}
