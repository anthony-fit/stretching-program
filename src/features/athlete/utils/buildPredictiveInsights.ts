import { PredictiveEngineInput } from '../services/predictiveRecoveryEngine';

export function buildPredictiveInsights(input: PredictiveEngineInput): string[] {
  const insights: string[] = [];

  if (input.historyDays < 7) return insights;

  if (input.recentSkippedMeals >= 3) {
    insights.push("Recovery drift increases after 3+ skipped nutrition windows.");
  }

  if (input.excessiveRegenerations <= 2 && !input.decliningCompletion) {
    insights.push("Consistency improves when meal regenerations stay low. Trusting the plan yields results.");
  } else if (input.excessiveRegenerations > 10) {
    insights.push("High recipe regeneration correlates with decision fatigue. Consider simplifying future meals.");
  }

  if (input.hydrationInconsistency > 3 && input.lowRecoveryStreaks > 0) {
     insights.push("Hydration inconsistency is preceding low recovery streaks. Prioritize water intake early in the day.");
  }

  if (input.mobilityDropoff && input.recentSkippedMeals > 0) {
    insights.push("Simultaneous drops in mobility and nutrition suggest schedule friction. Try micro-habits.");
  }

  return insights;
}
