import { PredictiveRecoveryState, PredictiveStatus } from './predictiveRecoveryEngine';
import { BehavioralState } from './behavioralContinuityEngine';
import { WeeklyRhythmState } from './weeklyRecoveryRhythmEngine';
import { HabitMomentumMetrics } from '../utils/buildHabitMomentum';

export type AutonomousState = 
  | 'optimize'
  | 'stabilize'
  | 'recover'
  | 'deload'
  | 'simplify'
  | 'rebuild';

export interface AutonomousEngineInput {
  predictiveStatus: PredictiveStatus;
  behavioralState: BehavioralState;
  weeklyRhythm: WeeklyRhythmState;
  momentum: HabitMomentumMetrics;
  regenerationPressure: number; // 0-100 based on usage frequency
}

export interface AutonomousStatus {
  state: AutonomousState;
  routingBias: string;
  optimizationPressure: number; // 0-100
  stabilizationPriority: number; // 0-100
  systemLoad: number; // 0-100
}

export const autonomousRecoveryEngine = {
  detectState(input: AutonomousEngineInput): AutonomousStatus {
    const { predictiveStatus, behavioralState, weeklyRhythm, momentum, regenerationPressure } = input;

    // Derived metrics
    const overallRisk = (
      (predictiveStatus.burnoutPressure === 'high' ? 40 : predictiveStatus.burnoutPressure === 'moderate' ? 20 : 0) +
      (behavioralState === 'overwhelmed' || behavioralState === 'fatigued' ? 30 : 0) +
      (regenerationPressure > 70 ? 20 : 0) +
      (momentum.overallMomentum === 'At Risk' ? 30 : 0)
    );

    let state: AutonomousState = 'stabilize';
    let optimizationPressure = 0;
    let stabilizationPriority = 50;

    // Logic Tree
    if (behavioralState === 'disengaging' || momentum.overallMomentum === 'At Risk') {
      state = 'rebuild';
      stabilizationPriority = 90;
      optimizationPressure = 5;
    } else if (behavioralState === 'overwhelmed' || regenerationPressure > 80) {
      state = 'simplify';
      stabilizationPriority = 80;
      optimizationPressure = 10;
    } else if (behavioralState === 'fatigued' || predictiveStatus.state === 'burnout_risk') {
      state = 'recover';
      stabilizationPriority = 100;
      optimizationPressure = 0;
    } else if (weeklyRhythm === 'recovery_deload') {
      state = 'deload';
      stabilizationPriority = 70;
      optimizationPressure = 20;
    } else if (momentum.overallMomentum === 'Strong' && predictiveStatus.state === 'stable_growth') {
      state = 'optimize';
      stabilizationPriority = 20;
      optimizationPressure = 90;
    } else if (predictiveStatus.state === 'recovery_drift' || weeklyRhythm === 'unstable_rhythm') {
      state = 'stabilize';
      stabilizationPriority = 60;
      optimizationPressure = 40;
    }

    const systemLoad = Math.min(100, Math.round((regenerationPressure * 0.4) + (overallRisk * 0.6)));
    const routingBias = getRoutingBias(state);

    return {
      state,
      routingBias,
      optimizationPressure,
      stabilizationPriority,
      systemLoad
    };
  }
};

function getRoutingBias(state: AutonomousState): string {
  switch (state) {
    case 'optimize': return 'High performance, nutrient density, precision timing.';
    case 'stabilize': return 'Balanced nutrients, consistent windows, moderate complexity.';
    case 'recover': return 'Anti-inflammatory, high-hydration, sleep support bias.';
    case 'deload': return 'Reduced volume, maintenance nutrients, high variety.';
    case 'simplify': return 'Minimal prep, familiar recipes, 0-decision meals.';
    case 'rebuild': return 'Habit-first, micro-wins, fundamental proteins.';
    default: return 'Standard maintenance.';
  }
}
