import { AthleteMemorySnapshot, AdaptiveAthleteDNA } from '../types';

export function generateAdaptiveDNA(snapshots: AthleteMemorySnapshot[]): AdaptiveAthleteDNA {
  if (snapshots.length === 0) {
    return {
      athleteType: 'Uncalibrated',
      recoveryBias: 'Neutral',
      preferredIntensity: 'Moderate',
      consistencyScore: 0,
      adherenceTrend: 'Stable',
      mobilityFocusBias: 'General',
      fatiguePattern: 'Unknown',
      optimalSessionWindow: 20,
      recoverySensitivity: 'Unknown',
      progressionTrend: 'Stable'
    };
  }

  // Sort by date mostly recent last
  const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const consistencyScore = Math.min(100, Math.round((sorted.filter(s => s.sessionCompleted).length / Math.max(sorted.length, 1)) * 100));
  
  // Calculate Adherence Trend comparing recent half to older half
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  
  const firstHalfRate = firstHalf.length ? firstHalf.filter(s => s.sessionCompleted).length / firstHalf.length : 0;
  const secondHalfRate = secondHalf.length ? secondHalf.filter(s => s.sessionCompleted).length / secondHalf.length : 0;
  
  let adherenceTrend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
  if (secondHalfRate > firstHalfRate + 0.1) adherenceTrend = 'Improving';
  else if (secondHalfRate < firstHalfRate - 0.1) adherenceTrend = 'Declining';

  const durationAvg = sorted.reduce((acc, s) => acc + s.sessionDuration, 0) / sorted.length;
  let optimalSessionWindow = 20;
  if (durationAvg > 30) optimalSessionWindow = 35;
  else if (durationAvg < 15) optimalSessionWindow = 10;

  const avgRecovery = sorted.reduce((acc, s) => acc + s.recoveryScore, 0) / sorted.length;
  let recoverySensitivity = 'Moderate';
  if (avgRecovery < 50) recoverySensitivity = 'High (Requires frequent deloads)';
  else if (avgRecovery > 80) recoverySensitivity = 'Low (High resilience)';

  let preferredIntensity = 'Moderate';
  if (consistencyScore > 80 && optimalSessionWindow > 25) preferredIntensity = 'High';
  else if (consistencyScore < 50 || optimalSessionWindow < 15) preferredIntensity = 'Low';

  let athleteType = 'Consistency-Driven Mobility Builder';
  if (consistencyScore > 80 && optimalSessionWindow >= 30) athleteType = 'Precision Recovery Athlete';
  else if (consistencyScore < 30) athleteType = 'Sporadic Mover';
  else if (optimalSessionWindow < 20) athleteType = 'High Output / Low Recovery';

  return {
    athleteType,
    recoveryBias: avgRecovery > 70 ? 'Performance-Leaning' : 'Recovery-Leaning',
    preferredIntensity,
    consistencyScore,
    adherenceTrend,
    mobilityFocusBias: 'Dynamic Progression',
    fatiguePattern: adherenceTrend === 'Declining' ? 'Cumulative Fatigue Risk' : 'Sustainable Output',
    optimalSessionWindow,
    recoverySensitivity,
    progressionTrend: adherenceTrend === 'Improving' ? 'Linear Growth' : 'Plateau Default'
  };
}
