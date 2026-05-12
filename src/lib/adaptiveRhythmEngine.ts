import { inferMovementMetadata } from './movementIntelligence';

export type RhythmProfile = 'recovery_wave' | 'progressive_activation' | 'athletic_push' | 'decompression_flow' | 'balanced_circuit';

function determineProfile(items: any[]): RhythmProfile {
  let heavyCount = 0;
  let mobilityCount = 0;
  let stretchCount = 0;
  items.forEach(item => {
    const meta = inferMovementMetadata(item);
    if (meta.intensityProfile === 'high' || meta.movementPattern === 'strength') heavyCount++;
    if (meta.movementPattern === 'mobility') mobilityCount++;
    if (meta.movementPattern === 'stretch' || meta.movementPattern === 'recovery') stretchCount++;
  });

  const total = items.length;
  if (total === 0) return 'balanced_circuit';

  if (stretchCount > total * 0.6) return 'decompression_flow';
  if (stretchCount + mobilityCount > total * 0.6) return 'recovery_wave';
  if (heavyCount > total * 0.5) return 'athletic_push';
  if (mobilityCount > total * 0.4) return 'progressive_activation';
  return 'balanced_circuit';
}

export function applyAdaptiveRhythm(
  items: any[],
  scripts: any[],
  targetDurationSeconds: number
) {
  if (items.length === 0) return { items, scripts, intelligenceLogs: [] };
  
  const profile = determineProfile(items);
  const logs = [`[RHYTHM_ENGINE] Applied profile: ${profile}`];
  
  // 1. Calculate base weights for duration variability
  let totalWeight = 0;
  const weights = items.map((item, index) => {
    const meta = inferMovementMetadata(item);
    let weight = 1.0;
    
    // Anchor movements (high intensity, strength) get more time
    if (meta.intensityProfile === 'high') weight += 0.3;
    if (meta.movementPattern === 'strength') weight += 0.2;
    
    // Warmup / Cooldown shifts
    if (index === 0) weight += 0.5; // Longer initial warmup/setup
    if (index === items.length - 1) weight += 0.5; // Longer final cooldown

    // Transitions or minor movements get less time
    if (meta.movementPattern === 'mobility' && index !== 0 && index !== items.length - 1) weight -= 0.1;
    
    totalWeight += weight;
    return weight;
  });
  
  // 2. Distribute durations to prevent 30s/30s/30s
  let runningTotal = 0;
  items.forEach((item, index) => {
    if (index === items.length - 1) {
      item.duration = targetDurationSeconds - runningTotal; // Exact true up
    } else {
      let calcDuration = Math.round((weights[index] / totalWeight) * targetDurationSeconds);
      // Floor duration to prevent weird lengths, ensure safe min
      calcDuration = Math.max(10, calcDuration); 
      // Add slight modulo 5 variance (snap to nearest 5 for better pacing)
      calcDuration = Math.round(calcDuration / 5) * 5;
      
      item.duration = calcDuration;
      runningTotal += item.duration;
    }
    item.baseDuration = item.duration;
  });
  
  // Clean up exact last item length, if less than 10s, redistribute backwards smoothly
  if (items[items.length - 1].duration < 10 && items.length > 1) {
      let deficit = 10 - items[items.length - 1].duration;
      items[items.length - 1].duration = 10;
      items[items.length - 1].baseDuration = 10;
      
      for(let i = items.length - 2; i >= 0 && deficit > 0; i--) {
          if (items[i].duration > 15) {
              const steal = Math.min(deficit, 5); // take up to 5s
              items[i].duration -= steal;
              items[i].baseDuration -= steal;
              deficit -= steal;
          }
      }
  }

  // 3. Posture / Breathing Coach Injection (Repetition memory simulation)
  items.forEach((item, index) => {
    const meta = inferMovementMetadata(item);
    let scriptObj = scripts.find(s => s && s.exerciseName === item.name);
    
    if (scriptObj && Math.random() > 0.6) {
        if (meta.bodyPosition === 'standing' && index > items.length / 2) {
            if (!scriptObj.script.includes("posture")) {
              scriptObj.script = "Check your posture, stand tall. " + scriptObj.script;
            }
        } else if (meta.intensityProfile === 'high') {
             if (!scriptObj.script.includes("Breathe")) {
              scriptObj.script = "Breathe steady, keep the rhythm. " + scriptObj.script;
             }
        } else if (profile === 'decompression_flow' && index === items.length - 1) {
            scriptObj.script = scriptObj.script + " Let your heart rate settle. Amazing work.";
        } else if (meta.movementPattern === 'recovery') {
            if (!scriptObj.script.includes("relax")) {
                scriptObj.script = scriptObj.script + " Deep exhale, relax into the position.";
            }
        }
    }
  });
  
  let uniqueDurations = new Set(items.map(i => i.duration));

  return {
    items,
    scripts,
    intelligenceLogs: logs,
    diagnostics: {
      profile,
      varianceScore: Math.round((uniqueDurations.size / items.length) * 100),
      durationSpread: Array.from(uniqueDurations).join(', ')
    }
  };
}
