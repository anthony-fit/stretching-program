import { UserMetrics } from '../types';
import { safeNumber, clamp, NUTRITION_CONSTRAINTS } from '../utils/mathUtils';

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation.
 * Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export function calculateBMR(metrics: UserMetrics): number {
  const weight = clamp(safeNumber(metrics.weight), NUTRITION_CONSTRAINTS.MIN_WEIGHT, NUTRITION_CONSTRAINTS.MAX_WEIGHT);
  const height = clamp(safeNumber(metrics.height), NUTRITION_CONSTRAINTS.MIN_HEIGHT, NUTRITION_CONSTRAINTS.MAX_HEIGHT);
  const age = clamp(safeNumber(metrics.age), NUTRITION_CONSTRAINTS.MIN_AGE, NUTRITION_CONSTRAINTS.MAX_AGE);

  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
  
  return metrics.gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}
