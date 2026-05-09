export const GOVERNANCE_RULES = {
  MIN_SCENE_DURATION_SEC: 5,
  MAX_SCENE_DURATION_SEC: 120,
  TARGET_SPOKEN_WORDS_PER_SEC: 2.5,
  MAX_SPOKEN_WORDS_PER_SEC: 3.2,
  MAX_REPETITIONS_PER_WORKOUT: 2,
};

export function enforceGovernance(blueprint: any, targetDurationSeconds: number, distributionConstraints?: any) {
  if (!blueprint || !blueprint.scenes) return blueprint;

  // 0. Environmental Initial Hook Scene Sizing
  if (distributionConstraints && distributionConstraints.maxInitialSceneDuration && blueprint.scenes[0]) {
     if (blueprint.scenes[0].duration > distributionConstraints.maxInitialSceneDuration) {
        blueprint.scenes[0].duration = distributionConstraints.maxInitialSceneDuration;
     }
  }

  // 1. Duration Integrity - Force total duration to match target strictly
  let totalDuration = 0;
  blueprint.scenes.forEach((s: any) => totalDuration += (s.duration || 10));

  if (Math.abs(totalDuration - targetDurationSeconds) > 2 && targetDurationSeconds > 0) {
    const ratio = targetDurationSeconds / totalDuration;
    let newTotal = 0;
    blueprint.scenes = blueprint.scenes.map((scene: any, index: number) => {
      if (index === blueprint.scenes.length - 1) {
        scene.duration = Math.max(GOVERNANCE_RULES.MIN_SCENE_DURATION_SEC, targetDurationSeconds - newTotal);
      } else {
        scene.duration = Math.max(GOVERNANCE_RULES.MIN_SCENE_DURATION_SEC, Math.round((scene.duration || 10) * ratio));
        newTotal += scene.duration;
      }
      return scene;
    });
  }

  // 2. Cognitive Load & Content Density
  const exerciseCounts: Record<string, number> = {};

  blueprint.scenes = blueprint.scenes.map((scene: any, i: number) => {
    // Movement Variation Enforcement
    exerciseCounts[scene.exerciseId] = (exerciseCounts[scene.exerciseId] || 0) + 1;
    if (exerciseCounts[scene.exerciseId] > GOVERNANCE_RULES.MAX_REPETITIONS_PER_WORKOUT) {
      console.warn(`[Governance] Exercise repetition limit reached for: ${scene.exerciseId}.`);
      // In a full implementation, we'd query the DB for an alternative target muscle exercise here
    }

    // Subtitle Density and Pacing Constraints
    if (scene.script) {
      const words = scene.script.split(/\s+/);
      const wps = words.length / scene.duration;

      if (wps > GOVERNANCE_RULES.MAX_SPOKEN_WORDS_PER_SEC) {
        console.warn(`[Governance] Scene ${i} word density (${wps.toFixed(1)} wps) exceeds cognitive load boundaries. Trimming narration.`);
        const allowedWords = Math.floor(scene.duration * GOVERNANCE_RULES.MAX_SPOKEN_WORDS_PER_SEC);
        scene.script = words.slice(0, allowedWords).join(" ");
      }

      if (wps < 0.5 && scene.duration > 15) {
         // Too much silence for a long scene, maybe flag it.
      }
    }

    // Fallbacks
    if (!scene.cameraBehavior) scene.cameraBehavior = "static";
    if (!scene.energyLevel) scene.energyLevel = "medium";

    return scene;
  });

  // 3. Structural Metadata & Blueprint Versioning
  blueprint.metadata = {
    blueprintVersion: "1.0.0",
    orchestrationVersion: "1.4.0",
    compositionModel: "groq-llama-3.3-70b",
    governanceProfile: "strict-pacing-v1",
    generationSeed: Math.random().toString(36).substring(2, 10),
    title: blueprint.title,
    hook: blueprint.hook,
    pacingArc: blueprint.pacingArc,
    soundtrackProfile: blueprint.soundtrackProfile
  };

  return blueprint;
}
