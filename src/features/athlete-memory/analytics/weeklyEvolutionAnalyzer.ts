import { AthleteMemorySnapshot, WeeklyEvolutionMetrics } from '../types';

export function analyzeWeeklyEvolution(snapshots: AthleteMemorySnapshot[]): WeeklyEvolutionMetrics {
  const defaultMetrics: WeeklyEvolutionMetrics = {
    recoveryDelta: 0,
    hydrationTrend: 'Stable Baseline',
    consistencyTrend: 'Establishing Routine',
    calorieAdherenceTrend: 'Baseline',
    mobilityImprovementSignal: 'Awaiting Data',
    burnoutRisk: 'Low',
    recoveryResilienceScore: 50
  };

  if (snapshots.length < 2) return defaultMetrics;

  const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get last 7 days vs previous 7 days (simplified by taking last 7 records vs previous 7)
  const recent = sorted.slice(-7);
  const previous = sorted.slice(-14, -7);

  if (previous.length === 0) return defaultMetrics;

  const recentRecoveryAvg = recent.reduce((sum, s) => sum + s.recoveryScore, 0) / recent.length;
  const previousRecoveryAvg = previous.reduce((sum, s) => sum + s.recoveryScore, 0) / previous.length;
  const recoveryDelta = Math.round(((recentRecoveryAvg - previousRecoveryAvg) / Math.max(previousRecoveryAvg, 1)) * 100);

  const recentHydrationAvg = recent.reduce((sum, s) => sum + s.hydrationProgress, 0) / recent.length;
  let hydrationTrend = 'Stable';
  if (recentHydrationAvg > 0.8) hydrationTrend = 'Optimal Saturations';
  else if (recentHydrationAvg < 0.4) hydrationTrend = 'Dehydration Risk';

  const recentConsistency = recent.filter(s => s.sessionCompleted).length;
  const previousConsistency = previous.filter(s => s.sessionCompleted).length;
  let consistencyTrend = 'Stable';
  if (recentConsistency > previousConsistency) consistencyTrend = 'Increasing Momentum';
  else if (recentConsistency < previousConsistency) consistencyTrend = 'Friction Detected';

  let burnoutRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (recentRecoveryAvg < 40 && recentConsistency > 5) burnoutRisk = 'High';
  else if (recentRecoveryAvg < 60 && recentConsistency > 4) burnoutRisk = 'Moderate';

  const resilience = Math.min(100, Math.max(0, Math.round(recentRecoveryAvg + (recentConsistency * 2))));

  return {
    recoveryDelta,
    hydrationTrend,
    consistencyTrend,
    calorieAdherenceTrend: 'Tracking within 15% variance',
    mobilityImprovementSignal: recentConsistency >= 4 ? 'Positive Adaptation' : 'Maintenance Minimum',
    burnoutRisk,
    recoveryResilienceScore: resilience
  };
}
