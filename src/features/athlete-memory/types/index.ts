export interface AthleteMemorySnapshot {
  id: string; // ISO Date
  date: string; // ISO Date
  sessionCompleted: boolean;
  sessionDuration: number;
  sessionFocus: string;
  recoveryScore: number;
  hydrationProgress: number;
  calorieAdherence: number;
  mobilityAdherence: number; // 0 or 1
  fatigueLevel: number;
  preferredVibe?: string;
}

export interface AdaptiveAthleteDNA {
  athleteType: string;
  recoveryBias: string;
  preferredIntensity: string;
  consistencyScore: number;
  adherenceTrend: 'Improving' | 'Stable' | 'Declining';
  mobilityFocusBias: string;
  fatiguePattern: string;
  optimalSessionWindow: number; // minutes
  recoverySensitivity: string;
  progressionTrend: string;
}

export interface WeeklyEvolutionMetrics {
  recoveryDelta: number; // % change 
  hydrationTrend: string;
  consistencyTrend: string;
  calorieAdherenceTrend: string;
  mobilityImprovementSignal: string;
  burnoutRisk: 'Low' | 'Moderate' | 'High';
  recoveryResilienceScore: number; // 0-100
}
