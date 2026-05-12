import { MealEntry, HydrationLog, CaloriesBurnedEntry, NutritionProfile } from '../../nutrition/types';
import { WorkoutReport } from '../../../lib/reports';
import { RecoveryScoreResult } from '../types';

export function calculateRecoveryScore(
  profile: NutritionProfile,
  meals: MealEntry[],
  hydration: HydrationLog[],
  activity: CaloriesBurnedEntry[],
  reports: WorkoutReport[]
): RecoveryScoreResult {
  const now = Date.now();
  const todayStart = new Date(now).setHours(0, 0, 0, 0);
  
  // 1. Nutrition Score (Protein focus)
  const todayMeals = meals.filter(m => m.timestamp >= todayStart);
  const totalProtein = todayMeals.reduce((acc, m) => acc + (m.protein || 0), 0);
  const proteinTarget = profile.targets.protein;
  const nutritionScore = Math.min(100, (totalProtein / proteinTarget) * 100);

  // 2. Hydration Score
  const todayHydration = hydration.filter(h => h.timestamp >= todayStart);
  const totalWater = todayHydration.reduce((acc, h) => acc + h.amountLiters, 0);
  const waterTarget = profile.hydrationTarget;
  const hydrationScore = Math.min(100, (totalWater / waterTarget) * 100);

  // 3. Mobility Score (Based on recent reports)
  const recentReports = reports.filter(r => new Date(r.date).getTime() >= todayStart - (3 * 24 * 60 * 60 * 1000));
  const mobilityScore = recentReports.length > 0 
    ? Math.min(100, (recentReports.length / 3) * 100) 
    : 0;

  // 4. Combined weighted score
  // Weights: 40% Hydration, 40% Protein, 20% Mobility Consistency
  const score = Math.round(
    (hydrationScore * 0.4) + 
    (nutritionScore * 0.4) + 
    (mobilityScore * 0.2)
  );

  const warnings: string[] = [];
  if (hydrationScore < 50) warnings.push('Hydration critical: Connective tissue elasticity reduced.');
  if (nutritionScore < 60) warnings.push('Protein synthesis low: System recovery delayed.');
  if (mobilityScore < 50) warnings.push('Consistency warning: Movement patterns may be stiffening.');

  const recommendations: string[] = [];
  if (score < 50) {
    recommendations.push('Immediate hydration and gentle mobility required.');
    recommendations.push('Consider a deload session focusing on decompression.');
  } else if (score < 80) {
    recommendations.push('Maintain current nutrition pacing.');
    recommendations.push('Focus on joint-specific activation before training.');
  } else {
    recommendations.push('System readiness peak: Optimal for high-intensity flows.');
  }

  let readiness: 'High' | 'Moderate' | 'Low' = 'Low';
  if (score > 80) readiness = 'High';
  else if (score > 50) readiness = 'Moderate';

  return {
    recoveryScore: score,
    hydrationScore,
    mobilityScore,
    nutritionScore,
    readiness,
    warnings,
    recommendations,
    timestamp: now
  };
}
