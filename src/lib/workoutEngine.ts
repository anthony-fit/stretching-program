import { Exercise, EXERCISE_DATABASE } from "../data/exercises";

import { UserProgression, Program } from "./programming";

export interface WorkoutPreferences {
  durationMinutes: number;
  type: string;
  level: string;
  focus: string;
  painPoints: string[];
  equipment: string[];
  intensity: string;
  targetMuscles: string[];
  progression?: UserProgression;
  program?: Program;
}

export interface WorkoutSummary {
  primaryGoal: string;
  trainingFocus: string;
  mobilityEmphasis: number; // 0-100
  strengthEmphasis: number; // 0-100
  cardioEmphasis: number; // 0-100
  recoveryFocus: string;
  safetyNotes: string[];
  reasoning: string;
}

export interface IntelligentExerciseResult {
  duration: number;
  exercise: Exercise;
  reason: string;
}

export interface IntelligentRoutineResult {
  exercises: IntelligentExerciseResult[];
  summary: WorkoutSummary;
}

export function generateIntelligentRoutine(prefs: WorkoutPreferences): IntelligentRoutineResult {
  // 1. Initial Filtering
  let available = EXERCISE_DATABASE.filter(ex => {
    if (ex.equipment?.length && !ex.equipment.includes("None")) {
      const needed = ex.equipment.some(e => (prefs.equipment || []).includes(e));
      if (!needed) return false;
    }

    if (prefs.level === "Beginner" && ex.isSafeForBeginners === false) {
      return false;
    }

    return true;
  });

  if (available.length === 0) {
    available = EXERCISE_DATABASE.filter(ex => ex.equipment?.includes("None") || !ex.equipment);
  }

  if (available.length === 0) {
    available = [EXERCISE_DATABASE[0]];
  }

  // 2. Scoring with detailed tracking
  let scoredExercises = available.map(ex => {
    let score = 0;
    const reasons: string[] = [];

    if (ex.category === prefs.type || ex.trainingStyle?.includes(prefs.type)) {
      score += 15;
      reasons.push(`Matches ${prefs.type} protocol`);
    }

    if (ex.focus.includes(prefs.focus) || prefs.focus === "Full Body") {
      score += 5;
      reasons.push(`Targeting ${prefs.focus}`);
    }

    if (prefs.targetMuscles && prefs.targetMuscles.length > 0) {
      const matchingMuscles = ex.targetMuscles?.filter(m => prefs.targetMuscles.includes(m)) || [];
      if (matchingMuscles.length > 0) {
        score += matchingMuscles.length * 5;
        reasons.push(`Emphasis on ${matchingMuscles.join(', ')}`);
      }
    }

    if (prefs.painPoints && prefs.painPoints.length > 0) {
      const painMatch = ex.painPointsAddressed?.filter(p => prefs.painPoints.includes(p)) || [];
      if (painMatch.length > 0) {
        score += painMatch.length * 20;
        reasons.push(`Therapeutic for ${painMatch.join(', ')}`);
      }
    }

    if (prefs.intensity === "Low" && (ex.category === "Stretching" || ex.category === "Mobility")) {
      score += 10;
      reasons.push("Low-impact recovery movement");
    }
    if (prefs.intensity === "High" && (ex.category === "HIIT" || ex.category === "Strength")) {
      score += 10;
      reasons.push("High-intensity workload");
    }

    // 2.1 Progression & Phasing Logic
    if (prefs.program) {
      const currentPhase = prefs.program.phases[prefs.program.currentPhaseIndex];
      if (currentPhase.type === 'Recovery' && (ex.category === 'Mobility' || ex.category === 'Stretching')) {
        score += 15;
        reasons.push(`Aligned with ${currentPhase.name} recovery phase`);
      }
      if (currentPhase.priorityFocus.some(f => ex.focus.includes(f) || ex.mobilityTags?.includes(f))) {
        score += 10;
        reasons.push(`Phase priority: ${currentPhase.priorityFocus.join(', ')}`);
      }
    }

    if (prefs.progression) {
      // Avoid overtraining fatigued muscles
      const fatigueLevels = prefs.progression.muscleFatigueLevels || {};
      const fatigueKeys = Object.keys(fatigueLevels);
      const heavilyFatigued = fatigueKeys.filter(m => (fatigueLevels[m] ?? 0) > 70);
      if (ex.targetMuscles?.some(m => heavilyFatigued.includes(m))) {
        score -= 15;
        reasons.push("Reducing load on fatigued tissues");
      }

      // Progression push: if intensity exposure is low, slightly boost difficulty
      const recentExposure = prefs.progression.recentIntensityExposure || [];
      const avgIntensity = recentExposure.length > 0 
        ? recentExposure.reduce((a, b) => a + b, 0) / recentExposure.length 
        : 0;
      if (avgIntensity < 5 && prefs.intensity === 'High' && ex.category === 'Strength') {
        score += 5;
        reasons.push("Progression nudge: Increasing volume");
      }
    }

    score += Math.random() * 2;

    return { 
      exercise: ex, 
      score, 
      reason: reasons.length > 0 ? reasons.join(" • ") : "Optimal workout flow component"
    };
  });

  scoredExercises.sort((a, b) => b.score - a.score);

  const totalSeconds = prefs.durationMinutes * 60;
  const targetExerciseCount = Math.min(
    scoredExercises.length,
    Math.max(1, Math.floor(totalSeconds / 45))
  );
  
  const topPool = scoredExercises.slice(0, targetExerciseCount * 2);
  const selected: { exercise: Exercise, reason: string }[] = [];
  
  const poolCopy = [...topPool];
  while (selected.length < targetExerciseCount && poolCopy.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(5, poolCopy.length));
    selected.push({ exercise: poolCopy[idx].exercise, reason: poolCopy[idx].reason });
    poolCopy.splice(idx, 1);
  }

  const durationPerEx = Math.floor(totalSeconds / selected.length);
  const results = selected.map(s => ({
    duration: durationPerEx,
    exercise: s.exercise,
    reason: s.reason
  }));

  // 3. Generate Summary
  const categories = results.map(r => r.exercise.category);
  const mobilityCount = categories.filter(c => c === 'Mobility' || c === 'Stretching').length;
  const strengthCount = categories.filter(c => c === 'Strength').length;
  const cardioCount = categories.filter(c => c === 'Cardio').length;
  const total = results.length;

  const summary: WorkoutSummary = {
    primaryGoal: (prefs.painPoints && prefs.painPoints.length > 0) ? `Addressing ${prefs.painPoints[0]}` : `${prefs.type} Session`,
    trainingFocus: prefs.focus,
    mobilityEmphasis: Math.round((mobilityCount / total) * 100),
    strengthEmphasis: Math.round((strengthCount / total) * 100),
    cardioEmphasis: Math.round((cardioCount / total) * 100),
    recoveryFocus: mobilityCount > total / 2 ? "High Priority" : "Balanced",
    safetyNotes: [
      prefs.level === "Beginner" ? "Low-impact modifications prioritized" : "Standard intensity parameters",
      (prefs.painPoints && prefs.painPoints.includes("Lower Back Pain")) ? "Spinal neutral movements emphasized" : "Core stability focus"
    ],
    reasoning: `This ${prefs.intensity} intensity workout was built to target ${prefs.focus} while ${(prefs.painPoints && prefs.painPoints.length > 0) ? `prioritizing relief for ${prefs.painPoints.join(', ')}` : 'maintaining optimal movement flow'}.`
  };

  return { exercises: results, summary };
}
