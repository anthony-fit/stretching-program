export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type Goal = 'fat_loss' | 'maintenance' | 'muscle_gain' | 'recovery' | 'wellness';

export interface UserMetrics {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface MacroTargets {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface METActivity {
  id: string;
  name: string;
  metValue: number;
  category: 'stretching' | 'yoga' | 'mobility' | 'walking' | 'recovery' | 'cardio' | 'strength';
}

export interface NutritionProfile extends UserMetrics {
  goal: Goal;
  targets: MacroTargets;
  hydrationTarget: number; // in liters
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface TimelineMealSlot {
  category: MealCategory;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number; // in grams
  targetFat: number; // in grams
  plannedTime?: string; // HH:mm format optional
  generatedRecipe?: {
    title: string;
    ingredients: string[];
    prepSteps: string[];
    tags: string[];
    estimatedPrepTime: string;
  };
  loggedMealId?: string;
  status?: 'pending' | 'skipped' | 'ate_half' | 'completed';
  regenerationCount?: number;
}

export interface DailyMealTimeline {
  id: string; // YYYY-MM-DD or unique ID
  date: string; // YYYY-MM-DD
  slots: TimelineMealSlot[];
  isActive: boolean;
  createdAt: number;
}

export interface MealEntry {
  id: string;
  foodId: string;
  name: string;
  category: MealCategory;
  amount: number; // multiplier of servingSize
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface BodyMetricEntry {
  id: string;
  weight: number;
  bodyFat?: number;
  timestamp: number;
}

export interface CaloriesBurnedEntry {
  id: string;
  activityId: string;
  activityName: string;
  durationMinutes: number;
  calories: number;
  timestamp: number;
}

export interface HydrationLog {
  id: string;
  amountLiters: number;
  timestamp: number;
}

export interface NutritionPreferences {
  units: 'metric' | 'imperial';
  darkMode: boolean;
  onboardingCompleted: boolean;
}

export interface NutritionStorageState {
  profile: NutritionProfile | null;
  preferences: NutritionPreferences;
  lastSync: number | null;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'wger' | 'off' | 'local';
  image?: string;
}

export interface FoodDetailsResponse {
  food: FoodItem;
  source: string;
}

export interface NutritionSearchResponse {
  results: FoodSearchResult[];
  total: number;
  page: number;
}

export interface NutritionErrorResponse {
  error: string;
  code: string;
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  hydration: HydrationLog[];
  caloriesBurned: CaloriesBurnedEntry[];
  bodyMetrics?: BodyMetricEntry;
}
