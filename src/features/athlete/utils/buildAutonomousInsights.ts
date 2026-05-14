import { AutonomousStatus, AutonomousState } from '../services/autonomousRecoveryEngine';
import { ArbitrationDecision } from '../services/recoveryPressureArbitrator';

export function buildAutonomousInsights(status: AutonomousStatus, decision: ArbitrationDecision): string[] {
  const insights: string[] = [];

  const stateMessages: Record<AutonomousState, string> = {
    optimize: "System routing prioritized for peak performance and nutrient precision.",
    stabilize: "Maintaining foundational rhythms while monitoring recovery drift.",
    recover: "Active deload engaged. Prioritizing physiological restoration.",
    deload: "Strategic volume reduction to prevent long-term fatigue accumulation.",
    simplify: "System complexity reduced to combat decision fatigue and high load.",
    rebuild: "Momentum reset active. Focusing on fundamental consistency layers."
  };

  insights.push(stateMessages[status.state]);

  if (decision.shouldSimplify) {
    insights.push("Low-complexity routing enabled to reduce prep surface area.");
  }

  if (status.systemLoad > 75) {
    insights.push("High system load detected: Adaptive buffers and recovery bias intensified.");
  }

  if (status.stabilizationPriority > 80) {
    insights.push("Stability shield active: Prioritizing completion over optimization.");
  }

  return insights;
}
