import { AdaptiveAthleteDNA, WeeklyEvolutionMetrics } from '../types';

export function calculateSessionConfidence(
  duration: number,
  dna: AdaptiveAthleteDNA | null,
  evolution: WeeklyEvolutionMetrics | null
): number {
  if (!dna) return 75; // Default standard confidence

  let score = dna.consistencyScore;

  // Penalize heavily if duration exceeds historical adherence by significant margin
  if (duration > dna.optimalSessionWindow + 15) {
    score -= 30;
  } else if (duration > dna.optimalSessionWindow + 5) {
    score -= 15;
  } else if (duration <= dna.optimalSessionWindow) {
    score += 10;
  }

  // Adjust for burnout risk
  if (evolution) {
    if (evolution.burnoutRisk === 'High') score -= 25;
    if (evolution.burnoutRisk === 'Moderate') score -= 10;
    
    if (evolution.consistencyTrend === 'Increasing Momentum') score += 15;
  }

  return Math.min(100, Math.max(0, score));
}
