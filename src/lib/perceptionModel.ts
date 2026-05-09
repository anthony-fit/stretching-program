import { CompositionBlueprint } from "./compositionPlanner";
import { AudienceContext } from "./distributionIntelligence";

export interface PerceptionScore {
  totalScore: number;
  cognitiveFatigue: number; // 0-100 (lower fatigue = higher score)
  emotionalArc: number;     // 0-100
  attentionRetention: number; // 0-100
  silenceIntelligence: number; // 0-100
  flaggedRisks: string[];
}

export function simulateViewerExperience(blueprint: CompositionBlueprint, context?: AudienceContext): PerceptionScore {
  if (!blueprint || !blueprint.scenes || blueprint.scenes.length === 0) {
    return { 
      totalScore: 0, 
      cognitiveFatigue: 0, 
      emotionalArc: 0, 
      attentionRetention: 0, 
      silenceIntelligence: 0, 
      flaggedRisks: ["Empty blueprint"] 
    };
  }

  let fatigueAccumulation = 0;
  let emotionalPeaks = 0;
  let emotionalTroughs = 0;
  let silenceMoments = 0;
  const risks: string[] = [];

  let previousEnergy = "";

  blueprint.scenes.forEach((scene) => {
    // 1. Cognitive Fatigue evaluation (Subtitle pressure)
    const words = scene.script ? scene.script.split(/\s+/).length : 0;
    let wps = 0;
    if (scene.duration > 0) wps = words / scene.duration;

    if (wps > 2.5) {
      fatigueAccumulation += (wps - 2.5) * 10;
    } else if (wps < 0.5) {
      silenceMoments += scene.duration;
      fatigueAccumulation = Math.max(0, fatigueAccumulation - scene.duration * 0.5); // Recovery
    }

    // 2. Emotional Energy evaluation
    let energyLevel = scene.energyLevel || "medium";
    
    if (energyLevel === "peak" || energyLevel === "high") {
      emotionalPeaks++;
    } else if (energyLevel === "low") {
      emotionalTroughs++;
      fatigueAccumulation = Math.max(0, fatigueAccumulation - 10);
    }

    if (previousEnergy === energyLevel && energyLevel === "peak") {
       fatigueAccumulation += 15; // Sustained peak causes exhaustion
    }
    previousEnergy = energyLevel;
  });

  // Calculate Sub-scores
  
  // A good composition has breathing room. 10-30% of time should be silence/low dialogue
  const totalDuration = blueprint.scenes.reduce((acc, s) => acc + s.duration, 0);
  const silenceRatio = silenceMoments / (totalDuration || 1);
  let silenceIntelligence = 0;
  
  if (silenceRatio >= 0.1 && silenceRatio <= 0.4) {
     silenceIntelligence = 100;
  } else if (silenceRatio > 0.4) {
     silenceIntelligence = 70; // A bit too sparse
     risks.push("Excessive silence might lose attention.");
  } else {
     silenceIntelligence = 40;
     risks.push("Low silence intelligence; claustrophobic pacing.");
  }

  // Emotional pacing needs contrast
  let emotionalArc = 100;
  if (emotionalPeaks === 0) {
     emotionalArc -= 30; // Too flat
     risks.push("Emotionally flat; missing peaks.");
  }
  if (emotionalTroughs === 0) {
     emotionalArc -= 30; // Continuous high energy
     risks.push("Missing tension/release; continuous intensity.");
  }

  // Fatigue management
  let cognitiveFatigueScore = 100 - fatigueAccumulation;

  let attentionRetention = Math.max(0, Math.min(100, (emotionalArc + silenceIntelligence) / 2));

  // Contextual Awareness Penalities
  if (context) {
    // Platform-specific fatigue penalties
    if (context.platform === "tiktok" || context.platform === "instagram") {
      if (blueprint.scenes[0] && blueprint.scenes[0].duration > 8) {
         fatigueAccumulation += 20; // slow visual establishment on fast scroll feed
         risks.push("Visual establishment too slow for vertical feed.");
      }
      if (silenceRatio > 0.3) {
         attentionRetention -= 20; // too much silence drops attention on social
         risks.push("Too much silence for high-scroll vertical feed.");
      }
    } else if (context.platform === "youtube") {
      if (silenceRatio < 0.1) {
         cognitiveFatigueScore -= 20; // Youtube viewership permits and rewards deeper pacing
         risks.push("Insufficient breathing room for long-form platform.");
      }
    }

    // Environment-specific emotional penalties
    if (context.viewingEnvironment === "nighttime_recovery") {
      if (blueprint.pacingArc === "intervals" || blueprint.pacingArc === "waves") {
         emotionalArc -= 40;
         risks.push("Interval/Wave pacing violates nighttime recovery context.");
      }
      if (emotionalPeaks > 1) {
         emotionalArc -= 30;
         risks.push("Too many emotional peaks for evening decompression.");
      }
    } else if (context.viewingEnvironment === "morning_activation") {
      if (emotionalPeaks === 0) {
         emotionalArc -= 30;
         risks.push("Morning activation lacks sufficient emotional peaks.");
      }
    }
    
    // Muted/Silent environment penalties
    if (context.soundAvailability === "muted" || context.platform === "silent_autoplay") {
       if (blueprint.subtitleCadence === "relaxed") {
         cognitiveFatigueScore -= 10;
         risks.push("Relaxed subtitle cadence risks losing viewers in silent environments.");
       }
    }
  }

  if (cognitiveFatigueScore < 50) {
    risks.push("High cognitive fatigue. Subtitle pressure or sustained intensity is too high.");
  }
  cognitiveFatigueScore = Math.max(0, Math.min(100, cognitiveFatigueScore));
  
  const totalScore = (silenceIntelligence * 0.3) + (emotionalArc * 0.4) + (cognitiveFatigueScore * 0.3);

  return {
    totalScore: Math.round(totalScore),
    cognitiveFatigue: Math.round(cognitiveFatigueScore),
    emotionalArc: Math.round(emotionalArc),
    attentionRetention: Math.round(attentionRetention),
    silenceIntelligence: Math.round(silenceIntelligence),
    flaggedRisks: risks
  };
}
