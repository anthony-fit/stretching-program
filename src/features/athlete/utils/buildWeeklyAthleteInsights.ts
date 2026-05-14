import { WeeklyRhythmInput } from '../services/weeklyRecoveryRhythmEngine';

export function buildWeeklyAthleteInsights(input: WeeklyRhythmInput): string[] {
  const insights: string[] = [];

  if (input.historyDays < 3) return insights;

  if (input.avgHydrationConsistency > 80 && input.avgRecoveryScore > 75) {
    insights.push("Recovery stability improves significantly when hydration stays consistently high.");
  }

  if (input.regenerationFrequency > 7 && input.avgMealCompletion < 60) {
    insights.push("Meal adherence tends to drop after repeated recipe regenerations. Simpler defaults may reduce friction.");
  }

  if (input.burnoutIndicators > 2 && input.avgMobilityAdherence < 40) {
    insights.push("Dropped mobility adherence correlates with behavioral burnout. Scaling back intensity is recommended.");
  }

  if (input.avgMealCompletion > 85 && input.avgRecoveryScore > 80) {
    insights.push("Strong nutrition completion is effectively fueling high recovery scores.");
  }

  return insights;
}
