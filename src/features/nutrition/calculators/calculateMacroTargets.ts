import { Goal, MacroTargets } from '../types';

/**
 * Calculates Macro Targets based on calories and goal.
 * Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
 */
export function calculateMacroTargets(calories: number, goal: Goal, weightKg: number): MacroTargets {
  let proteinPerKg = 1.0;
  let fatPercentage = 0.25;

  switch (goal) {
    case 'fat_loss':
      proteinPerKg = 2.0;
      fatPercentage = 0.25;
      break;
    case 'muscle_gain':
      proteinPerKg = 1.8;
      fatPercentage = 0.20;
      break;
    case 'recovery':
      proteinPerKg = 1.6;
      fatPercentage = 0.30;
      break;
    case 'wellness':
    case 'maintenance':
    default:
      proteinPerKg = 1.2;
      fatPercentage = 0.25;
      break;
  }

  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;
  
  const fatCalories = Math.round(calories * fatPercentage);
  const fatGrams = Math.round(fatCalories / 9);
  
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  return {
    calories: Math.round(calories),
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams
  };
}
