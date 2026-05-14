import { MacroTargets, DailyMealTimeline, TimelineMealSlot, MealCategory } from '../types';

export interface TimelineEngineInput {
  date: string;
  targets: MacroTargets;
  recoveryScore: number; // 0-100
  workoutIntensity: 'rest' | 'light' | 'moderate' | 'heavy';
  workoutTime?: string; // HH:mm format optional
}

export const timelineGenerationEngine = {
  generate(input: TimelineEngineInput): DailyMealTimeline {
    const { date, targets, recoveryScore, workoutIntensity } = input;
    
    // Base percentages for a standard day
    let split = {
      breakfast: 0.25,
      lunch: 0.30,
      dinner: 0.30,
      snack: 0.15,
      pre_workout: 0,
      post_workout: 0
    };

    // Adjust based on workout intensity
    if (workoutIntensity === 'moderate' || workoutIntensity === 'heavy') {
      split = {
        breakfast: 0.20,
        lunch: 0.25,
        dinner: 0.25,
        snack: 0.10,
        pre_workout: 0.10,
        post_workout: 0.10
      };
      
      // If recovery is low, shift more carbs/calories into post-workout
      if (recoveryScore < 60) {
        split.post_workout += 0.05;
        split.dinner -= 0.05; // Borrow from dinner
      }
    } else if (workoutIntensity === 'light') {
       split = {
        breakfast: 0.25,
        lunch: 0.30,
        dinner: 0.25,
        snack: 0.10,
        pre_workout: 0.0,
        post_workout: 0.10
      };
    }

    const createSlot = (cat: MealCategory, pct: number): TimelineMealSlot => {
      // Round to nearest integer to avoid fractional macros
      const calories = Math.round(targets.calories * pct);
      const protein = Math.round(targets.protein * pct);
      const carbs = Math.round(targets.carbs * pct);
      const fat = Math.round(targets.fat * pct);
      
      return {
        category: cat,
        targetCalories: calories,
        targetProtein: protein,
        targetCarbs: carbs,
        targetFat: fat
      };
    };

    const slots: TimelineMealSlot[] = [];
    let allocated = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // We add slots in order. The last slot will absorb rounding errors to ensure exact total.
    const addSlot = (cat: MealCategory, pct: number, isLast: boolean = false) => {
      if (pct <= 0) return;
      
      let slot = createSlot(cat, pct);
      
      if (isLast) {
        // Enforce exact totals
        slot.targetCalories = Math.max(0, targets.calories - allocated.calories);
        slot.targetProtein = Math.max(0, targets.protein - allocated.protein);
        slot.targetCarbs = Math.max(0, targets.carbs - allocated.carbs);
        slot.targetFat = Math.max(0, targets.fat - allocated.fat);
      } else {
        allocated.calories += slot.targetCalories;
        allocated.protein += slot.targetProtein;
        allocated.carbs += slot.targetCarbs;
        allocated.fat += slot.targetFat;
      }
      
      slots.push(slot);
    };

    // Add slots
    addSlot('breakfast', split.breakfast);
    if (split.pre_workout > 0) addSlot('pre_workout', split.pre_workout);
    addSlot('lunch', split.lunch);
    if (split.post_workout > 0) addSlot('post_workout', split.post_workout);
    addSlot('snack', split.snack);
    // Make dinner the last slot to absorb any rounding residue
    addSlot('dinner', split.dinner, true);

    return {
      id: crypto.randomUUID(),
      date,
      slots,
      isActive: false,
      createdAt: Date.now()
    };
  }
};
