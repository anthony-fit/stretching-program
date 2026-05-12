import { RecoveryScoreResult } from '../../recovery/types';
import { AthleteRecommendation, AthleteStreak } from '../types';
import { AdaptiveAthleteDNA } from '../../athlete-memory/types';

export function buildDailyAthleteFlow(
  recovery: RecoveryScoreResult | null,
  streaks: AthleteStreak,
  data: {
    hydrationProgress: number; // 0-1
    calorieBalance: number; // delta
    activityLevel: 'Low' | 'Medium' | 'High';
  },
  dna?: AdaptiveAthleteDNA
): AthleteRecommendation {
  const readiness = recovery?.recoveryScore || 0;
  
  let recommendedFocus: 'Recovery' | 'Maintenance' | 'Performance' = 'Maintenance';
  let suggestedDuration = 20;
  let mobilityRecommendation = 'Full body maintenance flow';
  let nutritionPriority = 'Maintain hydration baseline';
  let recoveryPriority = 'Standard joint decompression';
  const warnings: string[] = [];

  // Logic based on Readiness
  if (readiness < 40) {
    recommendedFocus = 'Recovery';
    suggestedDuration = 10;
    mobilityRecommendation = 'Gentle restorative floor work';
    nutritionPriority = 'Focus on anti-inflammatory hydration';
    recoveryPriority = 'Active rest and nervous system down-regulation';
    warnings.push('High fatigue detected. Avoid high-intensity flows.');
  } else if (readiness > 80) {
    recommendedFocus = 'Performance';
    suggestedDuration = 35;
    mobilityRecommendation = 'Advanced progressive range expansion';
    nutritionPriority = 'Optimal protein sync for peak recovery';
    recoveryPriority = 'Normal protocol. System baseline peak.';
  } else {
    recommendedFocus = 'Maintenance';
    suggestedDuration = 20;
    mobilityRecommendation = 'Standard mobility routine with joint activation';
    nutritionPriority = 'Balanced macros with consistent hydration';
    recoveryPriority = 'Standard recovery protocol.';
  }

  // Adjust suggestions based on Adaptive DNA
  if (dna) {
    // If athlete tends to quit long sessions, dial it down
    if (dna.optimalSessionWindow < suggestedDuration) {
      suggestedDuration = dna.optimalSessionWindow;
      warnings.push(`Duration auto-scaled to ${suggestedDuration}m based on your historical adherence curve.`);
    }

    if (dna.fatiguePattern === 'Cumulative Fatigue Risk' && recommendedFocus !== 'Recovery') {
      recommendedFocus = 'Recovery';
      suggestedDuration = Math.min(15, suggestedDuration);
      mobilityRecommendation = 'Preventative Deloading Flow (Adaptive Constraint)';
    }

    if (dna.athleteType === 'Precision Recovery Athlete' && readiness > 75) {
      mobilityRecommendation = 'Technical Range Expansion (Elite Bias)';
    }
  }

  // Logic based on Hydration
  if (data.hydrationProgress < 0.5) {
    warnings.push('Hydration levels are sub-optimal. Performance may be impacted.');
    nutritionPriority = 'RE-HYDRATION PRIORITY: 500ml intake immediately.';
  }

  // Logic based on Calories
  if (data.calorieBalance < -500 && data.activityLevel === 'High') {
    warnings.push('Significant caloric deficit with high activity. Recovery speed will be reduced.');
    nutritionPriority += ' | Increase carbohydrate intake for glycogen replenishment.';
  }

  // Adjust suggestions based on streaks
  if (streaks.mobilityCount > 7) {
    mobilityRecommendation += ' (Achievement: 1 Week Streak)';
  }

  return {
    readiness,
    recommendedFocus,
    suggestedDuration,
    mobilityRecommendation,
    nutritionPriority,
    recoveryPriority,
    warnings
  };
}
