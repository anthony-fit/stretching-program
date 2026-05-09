import { CompositionRecord, getCompositionMemory } from "./compositionMemory";

export interface ContinuityState {
  recoveryDebt: number; // 0-100 (high = needs recovery)
  recentMotifs: string[]; // hooks, themes
  recentIntensity: number; // average intensity of last few sessions
  identityProfile: "restrained_cinematic" | "calm_authoritative" | "energetic_performance" | "meditative_precision" | "athletic_documentary" | "recovery_editorial";
  recommendedEvolution: string; // Guidance for the next blueprint
}

export function getCurrentContinuityState(): ContinuityState {
  const memory = getCompositionMemory();
  const exported = memory.filter(m => m.status === "exported").sort((a, b) => b.timestamp - a.timestamp);

  if (exported.length === 0) {
    return {
      recoveryDebt: 0,
      recentMotifs: [],
      recentIntensity: 50,
      identityProfile: "restrained_cinematic",
      recommendedEvolution: "Establish the baseline. Introduce calm but authoritative pacing."
    };
  }

  // 1. Recovery Debt Accumulation & Motif Extraction
  const recent = exported.slice(0, 5);
  
  let totalFatigue = 0;
  let totalIntensity = 0;
  const motifs = new Set<string>();

  recent.forEach((m, idx) => {
    if (m.metadata) {
       const pacingArc = m.metadata.pacingArc;
       let intensityVal = 50;
       let fatigueVal = 0;
       
       if (pacingArc === "intervals" || pacingArc === "waves") {
          intensityVal = 90;
          fatigueVal = 30; // added fatigue
       } else if (pacingArc === "build-up") {
          intensityVal = 70;
          fatigueVal = 15;
       } else if (pacingArc === "steady") {
          intensityVal = 50;
          fatigueVal = 10;
       } else if (pacingArc === "cool-down") {
          intensityVal = 20;
          fatigueVal = -20; // recovery handles debt
       }
       
       const weight = 1 - (idx * 0.15); 
       
       totalFatigue += fatigueVal * weight; 
       totalIntensity += intensityVal * weight;
       
       if (m.metadata.hook) motifs.add(m.metadata.hook);
       if (m.metadata.title) motifs.add(m.metadata.title);
    }
  });

  const recoveryDebt = Math.min(100, Math.max(0, totalFatigue));
  const recentIntensity = Math.min(100, Math.max(0, totalIntensity / recent.length));
  
  // 2. Identity Persistence Evaluation
  let identityProfile: ContinuityState["identityProfile"] = "restrained_cinematic";
  
  if (recoveryDebt > 60) {
     identityProfile = "recovery_editorial";
  } else if (recentIntensity > 70) {
     identityProfile = "athletic_documentary";
  } else if (recentIntensity < 40) {
     identityProfile = "meditative_precision";
  } else {
     identityProfile = "calm_authoritative";
  }

  // 3. Recommended Progression Arc Evolution
  let recommendedEvolution = "";
  if (recoveryDebt > 70) {
    recommendedEvolution = "User carries high recovery debt. Shift to decompression and calm mobility. Avoid aggressive hooks. Use 'recovery_editorial' identity.";
  } else if (recoveryDebt < 30 && recent.length > 2) {
    recommendedEvolution = "User is fresh. Build deeper intensity and focused drive. Introduce a challenging but steady pace. Lean into 'athletic_documentary'.";
  } else {
    recommendedEvolution = "Maintain continuity. Evolve familiarity slightly without breaking established pacing. Preserve 'calm_authoritative'.";
  }

  return {
    recoveryDebt: Math.round(recoveryDebt),
    recentMotifs: Array.from(motifs).slice(0, 5),
    recentIntensity: Math.round(recentIntensity),
    identityProfile,
    recommendedEvolution
  };
}
