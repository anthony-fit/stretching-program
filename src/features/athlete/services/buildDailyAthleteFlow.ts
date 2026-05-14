import { RecoveryScoreResult } from '../../recovery/types';
import { AthleteRecommendation, AthleteStreak } from '../types';
import { AdaptiveAthleteDNA } from '../../athlete-memory/types';
import { AutonomousStatus } from './autonomousRecoveryEngine';
import { ArbitrationDecision } from './recoveryPressureArbitrator';

export function buildDailyAthleteFlow(
  recovery: RecoveryScoreResult | null,
  streaks: AthleteStreak,
  data: {
    hydrationProgress: number; // 0-1
    calorieBalance: number; // delta
    activityLevel: 'Low' | 'Medium' | 'High';
  },
  dna?: AdaptiveAthleteDNA,
  autonomousStatus?: AutonomousStatus,
  arbitration?: ArbitrationDecision
): AthleteRecommendation {
  const readiness = recovery?.recoveryScore || 0;
  
  let recommendedFocus: 'Recovery' | 'Maintenance' | 'Performance' = 'Maintenance';
  let suggestedDuration = 20;
  let mobilityRecommendation = 'Full body maintenance flow';
  let nutritionPriority = 'Maintain hydration baseline';
  let recoveryPriority = 'Standard joint decompression';
  const warnings: string[] = [];

  // 1. AROS Overrides (Highest Priority)
  const arosState = autonomousStatus?.state;
  
  if (arosState === 'simplify' || arosState === 'rebuild' || arbitration?.shouldSimplify) {
    recommendedFocus = 'Recovery';
    suggestedDuration = 10;
    mobilityRecommendation = 'Minimalist consistency flow (AROS Simplified)';
    nutritionPriority = 'Hydration and basic micronutrient sync';
    recoveryPriority = 'Active neurological reset';
    warnings.push('AROS Simplified Mode active: Focus on zero-barrier engagement.');
  } else if (arosState === 'recover' || arosState === 'deload') {
    recommendedFocus = 'Recovery';
    suggestedDuration = 15;
    mobilityRecommendation = 'Tissue restoration and joint decompression';
    warnings.push('Strategic recovery bias engaged via AROS.');
  } else if (arosState === 'optimize') {
    recommendedFocus = 'Performance';
    suggestedDuration = 30;
    mobilityRecommendation = 'Progressive expansion and load tolerance';
  }

  // 2. Fallback to Readiness Logic if not forced by AROS
  if (!arosState || arosState === 'stabilize' || arosState === 'optimize') {
    if (readiness < 40) {
      recommendedFocus = 'Recovery';
      suggestedDuration = 10;
      mobilityRecommendation = 'Gentle restorative floor work';
      nutritionPriority = 'Focus on anti-inflammatory hydration';
      recoveryPriority = 'Active rest and nervous system down-regulation';
      warnings.push('High fatigue detected. Avoid high-intensity flows.');
    } else if (readiness > 80 && arosState !== 'simplify') {
      recommendedFocus = 'Performance';
      suggestedDuration = 35;
      mobilityRecommendation = 'Advanced progressive range expansion';
      nutritionPriority = 'Optimal protein sync for peak recovery';
      recoveryPriority = 'Normal protocol. System baseline peak.';
    } else if (!arosState) {
      recommendedFocus = 'Maintenance';
      suggestedDuration = 20;
      mobilityRecommendation = 'Standard mobility routine with joint activation';
      nutritionPriority = 'Balanced macros with consistent hydration';
      recoveryPriority = 'Standard recovery protocol.';
    }
  }

  // 3. Adjust suggestions based on Adaptive DNA
  if (dna) {
    // If athlete tends to quit long sessions, dial it down
    if (dna.optimalSessionWindow < suggestedDuration) {
      suggestedDuration = dna.optimalSessionWindow;
      if (!warnings.some(w => w.includes('auto-scaled'))) {
        warnings.push(`Duration auto-scaled to ${suggestedDuration}m based on your historical adherence curve.`);
      }
    }

    if (dna.fatiguePattern === 'Cumulative Fatigue Risk' && recommendedFocus !== 'Recovery' && arosState !== 'optimize') {
      recommendedFocus = 'Recovery';
      suggestedDuration = Math.min(15, suggestedDuration);
      mobilityRecommendation = 'Preventative Deloading Flow (Adaptive Constraint)';
    }

    if (dna.athleteType === 'Precision Recovery Athlete' && readiness > 75 && arosState !== 'simplify') {
      mobilityRecommendation = 'Technical Range Expansion (Elite Bias)';
    }
  }

  // 4. Arbitration Strategy Enforcement
  if (arbitration) {
    if (arbitration.routingStrategy === 'minimalism') {
      suggestedDuration = Math.min(suggestedDuration, 12);
    }
    if (arbitration.routingStrategy === 'recovery') {
      recommendedFocus = 'Recovery';
    }
  }

  // 5. Logic based on Hydration
  if (data.hydrationProgress < 0.5) {
    warnings.push('Hydration levels are sub-optimal. Performance may be impacted.');
    nutritionPriority = 'RE-HYDRATION PRIORITY: 500ml intake immediately.';
  }

  // 6. Logic based on Calories
  if (data.calorieBalance < -500 && data.activityLevel === 'High') {
    warnings.push('Significant caloric deficit with high activity. Recovery speed will be reduced.');
    nutritionPriority += ' | Increase carbohydrate intake for glycogen replenishment.';
  }

  // 7. Adjust suggestions based on streaks
  if (streaks.mobilityCount > 7 && !mobilityRecommendation.includes('Streak')) {
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
