import { Exercise } from "../data/exercises";

export type BodyPosition = 'standing' | 'seated' | 'floor' | 'kneeling' | 'side_lying' | 'prone' | 'supine';
export type MovementPattern = 'mobility' | 'stretch' | 'strength' | 'cardio' | 'balance' | 'recovery';
export type IntensityProfile = 'low' | 'moderate' | 'high';
export type SideBias = 'left' | 'right' | 'bilateral';

export interface MovementMetadata {
  bodyPosition: BodyPosition;
  movementPattern: MovementPattern;
  intensityProfile: IntensityProfile;
  sideBias: SideBias;
}

export function inferMovementMetadata(exercise: Exercise | any): MovementMetadata {
  const name = (exercise.name || "").toLowerCase();
  const cat = (exercise.category || "").toLowerCase();
  const tags = (exercise.focus || []).map((t: string) => t.toLowerCase());

  let bodyPosition: BodyPosition = 'standing'; // default
  if (name.includes('seated') || name.includes('chair')) bodyPosition = 'seated';
  else if (name.includes('kneeling') || name.includes('quadruped') || name.includes('bird dog')) bodyPosition = 'kneeling';
  else if (name.includes('prone') || name.includes('superman') || name.includes('cobra') || name.includes('plank')) bodyPosition = 'prone';
  else if (name.includes('supine') || name.includes('bridge') || name.includes('dead bug') || name.includes('on back')) bodyPosition = 'supine';
  else if (name.includes('side') && (name.includes('lying') || name.includes('plank'))) bodyPosition = 'side_lying';
  else if (name.includes('floor') || tags.includes('floor')) bodyPosition = 'floor';
  else if (name.includes('squat') || name.includes('lunge') || name.includes('standing')) bodyPosition = 'standing';

  let movementPattern: MovementPattern = 'strength'; // default
  if (cat.includes('stretch') || name.includes('stretch') || name.includes('reach')) movementPattern = 'stretch';
  else if (cat.includes('mobility') || name.includes('circles') || name.includes('rolls')) movementPattern = 'mobility';
  else if (cat.includes('cardio') || name.includes('jump') || name.includes('sprint') || name.includes('run')) movementPattern = 'cardio';
  else if (cat.includes('yoga') || cat.includes('recovery') || name.includes('pose') || name.includes('child')) movementPattern = 'recovery';
  else if (name.includes('balance') || name.includes('single leg') || name.includes('hold')) movementPattern = 'balance';

  let intensityProfile: IntensityProfile = 'moderate';
  if (movementPattern === 'cardio' || exercise.level === 'Advanced' || name.includes('jump') || name.includes('sprint')) intensityProfile = 'high';
  else if (movementPattern === 'mobility' || movementPattern === 'stretch' || movementPattern === 'recovery' || exercise.level === 'Beginner') intensityProfile = 'low';

  let sideBias: SideBias = 'bilateral';
  if (name.includes('left') || tags.includes('left')) sideBias = 'left';
  else if (name.includes('right') || tags.includes('right')) sideBias = 'right';
  else if (name.includes('single arm') || name.includes('single leg') || name.includes('unilateral')) sideBias = 'left'; // Simplification

  return { bodyPosition, movementPattern, intensityProfile, sideBias };
}

const POSITION_TRANSITION_COSTS: Record<BodyPosition, Record<BodyPosition, number>> = {
  standing: { standing: 0, seated: 1, kneeling: 2, floor: 3, prone: 3, supine: 4, side_lying: 4 },
  seated: { standing: 2, seated: 0, kneeling: 1, floor: 1, prone: 2, supine: 2, side_lying: 2 },
  kneeling: { standing: 2, seated: 1, kneeling: 0, floor: 1, prone: 1, supine: 2, side_lying: 2 },
  floor: { standing: 3, seated: 1, kneeling: 1, floor: 0, prone: 1, supine: 1, side_lying: 1 },
  prone: { standing: 3, seated: 2, kneeling: 1, floor: 1, prone: 0, supine: 3, side_lying: 2 },
  supine: { standing: 4, seated: 2, kneeling: 2, floor: 1, prone: 3, supine: 0, side_lying: 1 },
  side_lying: { standing: 4, seated: 2, kneeling: 2, floor: 1, prone: 2, supine: 1, side_lying: 0 },
};

export function scoreMovementFlow(items: any[]): { score: number, issues: string[], penalties: number } {
  let score = 100;
  let issues: string[] = [];
  let penalties = 0;
  
  if (items.length < 2) return { score, issues, penalties };

  // Phase analysis
  const hasWarmup = inferMovementMetadata(items[0]).intensityProfile === 'low' || inferMovementMetadata(items[0]).movementPattern === 'mobility';
  if (!hasWarmup) {
    score -= 10;
    penalties += 10;
    issues.push("Missing low-intensity warmup");
  }

  const hasCooldown = inferMovementMetadata(items[items.length - 1]).intensityProfile === 'low' || inferMovementMetadata(items[items.length - 1]).movementPattern === 'stretch';
  if (!hasCooldown) {
    score -= 10;
    penalties += 10;
    issues.push("Missing low-intensity cooldown");
  }

  for (let i = 0; i < items.length - 1; i++) {
    const a = inferMovementMetadata(items[i]);
    const b = inferMovementMetadata(items[i+1]);

    const transitionCost = POSITION_TRANSITION_COSTS[a.bodyPosition][b.bodyPosition];
    if (transitionCost >= 3) {
      score -= 5;
      penalties += 5;
      issues.push(`Harsh transition from ${a.bodyPosition} to ${b.bodyPosition}`);
    }

    if (a.movementPattern === b.movementPattern && a.sideBias === b.sideBias && a.bodyPosition === b.bodyPosition && items[i].name === items[i+1].name) {
      score -= 10;
      penalties += 10;
      issues.push(`Repeated identical pattern: ${items[i].name}`);
    }

    if (a.intensityProfile === 'high' && b.intensityProfile === 'low' && transitionCost >= 2) {
      score -= 5;
      penalties += 5;
      issues.push(`Sudden drop in intensity combined with large position change`);
    }
  }

  return { score: Math.max(0, score), issues, penalties };
}

export function applyMovementIntelligence(items: any[], scripts: any[]) {
  if (items.length <= 2) {
    return { items, scripts, intelligenceLogs: [] };
  }

  // Resync scripts by name because earlier pipeline steps append scripts linearly at the end
  let paired = items.map((item, index) => {
    let matchedScript = scripts.find(s => s && s.exerciseName === item.name);
    if (!matchedScript) {
      matchedScript = scripts[index] || { exerciseName: item.name, script: "Follow the animation to maintain pace." };
    }
    return { item, script: matchedScript };
  });
  
  let currentAnalysis = scoreMovementFlow(paired.map(p => p.item));
  let bestPaired = [...paired];
  let bestScore = currentAnalysis.score;
  let issues = currentAnalysis.issues;

  if (bestScore < 90) {
    // Attempt flow optimization
    for (let attempts = 0; attempts < 5; attempts++) {
      let testPaired = [...bestPaired];
      let swapped = false;
      
      for (let i = 1; i < testPaired.length - 2; i++) {
        const a = inferMovementMetadata(testPaired[i].item);
        const b = inferMovementMetadata(testPaired[i+1].item);
        if (POSITION_TRANSITION_COSTS[a.bodyPosition][b.bodyPosition] >= 3) {
          const temp = testPaired[i];
          testPaired[i] = testPaired[i+1];
          testPaired[i+1] = temp;
          swapped = true;
          break; // Found a bad transition, swap and re-score
        }
      }

      if (swapped) {
        const testScore = scoreMovementFlow(testPaired.map(p => p.item));
        if (testScore.score > bestScore) {
          bestScore = testScore.score;
          bestPaired = testPaired;
          issues = testScore.issues;
        }
      } else {
        break; // No more harsh transitions to swap adjacent
      }
    }

    // Try missing warmup fix by bringing a low-intensity to front
    if (issues.includes("Missing low-intensity warmup")) {
      let testPaired = [...bestPaired];
      for (let i = 1; i < testPaired.length; i++) {
        if (inferMovementMetadata(testPaired[i].item).intensityProfile === 'low') {
          const warm = testPaired.splice(i, 1)[0];
          testPaired.unshift(warm);
          const fixScore = scoreMovementFlow(testPaired.map(p => p.item));
          if (fixScore.score >= bestScore) { // accept even if equal because it fixes a specific issue
             bestScore = fixScore.score;
             bestPaired = testPaired;
             issues = fixScore.issues;
          }
          break;
        }
      }
    }

    // Try missing cooldown fix by bringing a stretch/low-intensity to back
    if (issues.includes("Missing low-intensity cooldown")) {
      let testPaired = [...bestPaired];
      for (let i = 0; i < testPaired.length - 1; i++) {
        const meta = inferMovementMetadata(testPaired[i].item);
        if (meta.intensityProfile === 'low' || meta.movementPattern === 'stretch') {
          const cool = testPaired.splice(i, 1)[0];
          testPaired.push(cool);
          const fixScore = scoreMovementFlow(testPaired.map(p => p.item));
          if (fixScore.score >= bestScore) {
             bestScore = fixScore.score;
             bestPaired = testPaired;
             issues = fixScore.issues;
          }
          break;
        }
      }
    }
  }

  const logs = [];
  logs.push(`[MOVEMENT_INTELLIGENCE] Initial Flow Score: ${currentAnalysis.score}`);
  if (currentAnalysis.score < bestScore) {
    logs.push(`[MOVEMENT_INTELLIGENCE] Optimized Flow Score: ${bestScore} (Fixed sequencing issues)`);
  }
  if (issues.length > 0) {
    logs.push(`[MOVEMENT_INTELLIGENCE] Remaining transition penalties: ${issues.length}`);
  }

  return {
    items: bestPaired.map(p => p.item),
    scripts: bestPaired.map(p => p.script),
    intelligenceLogs: logs,
    diagnostics: {
       originalScore: currentAnalysis.score,
       finalScore: bestScore,
       issues
    }
  };
}
