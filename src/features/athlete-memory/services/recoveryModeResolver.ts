import { AdaptiveAthleteDNA } from '../types';

export type RecoveryMode = 
  | 'restore' 
  | 'balance' 
  | 'perform' 
  | 'deload' 
  | 'nervous-system-reset';

export function resolveRecoveryMode(
  readinessScore: number, 
  dna?: AdaptiveAthleteDNA | null,
  burnoutRisk?: 'Low' | 'Moderate' | 'High'
): RecoveryMode {
  
  if (burnoutRisk === 'High' || readinessScore < 40) return 'nervous-system-reset';
  if (readinessScore < 60) return 'restore';
  
  if (dna) {
    if (dna.fatiguePattern === 'Cumulative Fatigue Risk') return 'deload';
    if (dna.athleteType === 'Precision Recovery Athlete' && readinessScore > 80) return 'perform';
  }

  if (readinessScore > 85) return 'perform';
  
  return 'balance';
}
