export interface HabitMomentumInput {
  streakNutrition: number;
  streakMobility: number;
  recentSkippedMeals: number; // last 3 days
  recentCompletedMeals: number; // last 3 days
  hydrationConsistency: number; // % adherence to >2L over last 7 days
  recoveryTrend: number; // avg recovery last 7 days
}

export interface HabitMomentumMetrics {
  resilienceScore: number; // 0-100
  bounceBackSpeed: string; // 'Fast', 'Moderate', 'Slow'
  completionConsistency: number; // 0-100
  recoveryDiscipline: number; // 0-100
  overallMomentum: 'Strong' | 'Building' | 'Fading' | 'At Risk';
}

export function buildHabitMomentum(input: HabitMomentumInput): HabitMomentumMetrics {
  const totalRecentMeals = input.recentCompletedMeals + input.recentSkippedMeals;
  const completionConsistency = totalRecentMeals > 0 
    ? Math.round((input.recentCompletedMeals / totalRecentMeals) * 100) 
    : 0;

  const resilienceScore = Math.min(100, (input.streakMobility * 2) + (input.streakNutrition * 2) + (completionConsistency * 0.5));
  
  const recoveryDiscipline = Math.round((input.hydrationConsistency * 0.5) + (input.recoveryTrend * 0.5));

  let bounceBackSpeed = 'Slow';
  if (resilienceScore > 75) bounceBackSpeed = 'Fast';
  else if (resilienceScore > 40) bounceBackSpeed = 'Moderate';

  let overallMomentum: 'Strong' | 'Building' | 'Fading' | 'At Risk' = 'Building';
  if (resilienceScore > 80 && completionConsistency > 80) overallMomentum = 'Strong';
  else if (completionConsistency < 50 && input.streakMobility < 2) overallMomentum = 'At Risk';
  else if (completionConsistency < 70 || resilienceScore < 50) overallMomentum = 'Fading';

  return {
    resilienceScore,
    bounceBackSpeed,
    completionConsistency,
    recoveryDiscipline,
    overallMomentum
  };
}
