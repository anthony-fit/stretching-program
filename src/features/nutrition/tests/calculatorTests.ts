import { calculateBMR } from '../calculators/calculateBMR';
import { calculateTDEE } from '../calculators/calculateTDEE';
import { calculateMacroTargets } from '../calculators/calculateMacroTargets';
import { calculateCaloriesBurned } from '../calculators/calculateCaloriesBurned';
import { UserMetrics } from '../types';

export function runNutritionTests() {
  const results: string[] = [];

  // Test 1: BMR Calculation
  const testUser: UserMetrics = {
    age: 30,
    weight: 80,
    height: 180,
    gender: 'male',
    activityLevel: 'moderately_active'
  };

  const bmr = calculateBMR(testUser);
  results.push(`BMR (Male, 30, 80kg, 180cm): ${bmr} (Expected: ~1830)`);

  // Test 2: TDEE Calculation
  const tdee = calculateTDEE(testUser);
  results.push(`TDEE (Moderately Active): ${tdee} (Expected: ~2836)`);

  // Test 3: Macro Targets for Weight Loss
  const macros = calculateMacroTargets(tdee - 500, 'fat_loss', 80);
  results.push(`Macros (Fat Loss): Cal:${macros.calories}, P:${macros.protein}, C:${macros.carbs}, F:${macros.fat}`);

  // Test 4: Calories Burned (1 hour of dynamic stretching at 80kg)
  const burned = calculateCaloriesBurned(3.5, 80, 60);
  results.push(`Calories Burned (Stretching, 1hr, 80kg): ${burned} (Expected: 280)`);

  return results;
}

// For dev verification
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    console.log(runNutritionTests().join('\n'));
}
