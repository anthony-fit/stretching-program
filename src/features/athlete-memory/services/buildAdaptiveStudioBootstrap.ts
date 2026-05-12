import { AdaptiveAthleteDNA } from '../types';
import { RecoveryScoreResult } from '../../recovery/types';

export interface StudioBootstrapPresets {
  recommendedFocus: string;
  recommendedDuration: number;
  recommendedStyle: string; // e.g. minimal, technical
  recommendedFraming: string; 
  recommendedCoachTone: string;
  recommendedIntensity: string;
  recoveryMode: string;
  adaptiveReasoning: string;
}

export function buildAdaptiveStudioBootstrap(
  dna: AdaptiveAthleteDNA | null,
  recovery: RecoveryScoreResult | null,
  hydrationProgress?: number
): StudioBootstrapPresets {
  const readiness = recovery?.recoveryScore ?? 100;
  
  const defaults: StudioBootstrapPresets = {
    recommendedFocus: 'General Mobility',
    recommendedDuration: 15,
    recommendedStyle: 'technical',
    recommendedFraming: 'Standard',
    recommendedCoachTone: 'Encouraging',
    recommendedIntensity: 'Moderate',
    recoveryMode: 'balance',
    adaptiveReasoning: 'Standard initialization protocols selected.'
  };

  if (!dna) {
    if (readiness < 50) {
       defaults.recommendedFocus = 'Recovery';
       defaults.recommendedDuration = 10;
       defaults.recommendedStyle = 'wellness';
       defaults.recoveryMode = 'restore';
       defaults.adaptiveReasoning = 'Adjusted to recovery presets based on current system readiness score.';
    }
    return defaults;
  }

  // Adjust duration based on historical completion window
  let targetDuration = dna.optimalSessionWindow;
  let focus = dna.mobilityFocusBias;
  let style = 'technical';
  let recoveryMode = 'perform';
  let intensity = dna.preferredIntensity;
  let reasoning = `Your recent completions average ${dna.optimalSessionWindow}m. Optimized for ${dna.athleteType} archetype.`;

  if (dna.fatiguePattern === 'Cumulative Fatigue Risk' || readiness < 60) {
     targetDuration = Math.min(15, targetDuration);
     focus = 'Recovery';
     style = 'wellness';
     recoveryMode = 'deload';
     intensity = 'Low';
     reasoning = 'Cumulative fatigue detected. Duration compressed and intensity down-regulated for parasympathetic reset.';
  } else if (dna.athleteType === 'Precision Recovery Athlete' && readiness >= 80) {
     targetDuration = Math.max(20, targetDuration);
     focus = 'Performance';
     recoveryMode = 'perform';
     style = 'technical';
     intensity = 'High';
     reasoning = `High readiness enables technical range expansion tailored to your preference.`;
  }

  return {
    recommendedFocus: focus,
    recommendedDuration: targetDuration,
    recommendedStyle: style,
    recommendedFraming: 'Dynamic',
    recommendedCoachTone: 'Focused',
    recommendedIntensity: intensity,
    recoveryMode,
    adaptiveReasoning: reasoning
  };
}
