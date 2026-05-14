import { AutonomousStatus } from './autonomousRecoveryEngine';

export interface ArbitrationDecision {
  shouldSimplify: boolean;
  maxRecipeComplexity: number; // 1-5, where 1 is simplest
  allowRegenerationBurst: boolean;
  coachingTone: 'high-performance' | 'supportive' | 'rehabilitative';
  routingStrategy: 'precision' | 'consistency' | 'recovery' | 'minimalism';
}

export const recoveryPressureArbitrator = {
  arbitrate(status: AutonomousStatus): ArbitrationDecision {
    const { state, optimizationPressure, stabilizationPriority, systemLoad } = status;

    let shouldSimplify = false;
    let maxComplexity = 5;
    let allowBurst = true;
    let tone: 'high-performance' | 'supportive' | 'rehabilitative' = 'supportive';
    let strategy: 'precision' | 'consistency' | 'recovery' | 'minimalism' = 'consistency';

    // State-based adjustments
    if (state === 'optimize') {
      tone = 'high-performance';
      strategy = 'precision';
      maxComplexity = 5;
    } else if (state === 'recover' || state === 'deload') {
      tone = 'supportive';
      strategy = 'recovery';
      maxComplexity = 3;
      allowBurst = false;
    } else if (state === 'simplify' || state === 'rebuild') {
      tone = 'rehabilitative';
      strategy = 'minimalism';
      maxComplexity = 2;
      shouldSimplify = true;
      allowBurst = false;
    }

    // Load-based adjustments (Safeguards)
    if (systemLoad > 80) {
      shouldSimplify = true;
      maxComplexity = Math.min(maxComplexity, 2);
      allowBurst = false;
      tone = 'rehabilitative';
    }

    if (optimizationPressure < 30 && stabilizationPriority > 70) {
      strategy = state === 'rebuild' ? 'minimalism' : 'recovery';
    }

    return {
      shouldSimplify,
      maxRecipeComplexity: maxComplexity,
      allowRegenerationBurst: allowBurst,
      coachingTone: tone,
      routingStrategy: strategy
    };
  }
};
