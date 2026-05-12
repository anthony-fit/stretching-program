import { UserMetrics, ActivityLevel } from '../types';
import { calculateBMR } from './calculateBMR';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(metrics: UserMetrics): number {
  const bmr = calculateBMR(metrics);
  const multiplier = ACTIVITY_MULTIPLIERS[metrics.activityLevel] || 1.2;
  
  return Math.round(bmr * multiplier);
}
