export interface EditorialDiff {
  removedScenes: string[];
  trimmedScenes: {
    sceneId: string;
    originalDuration: number;
    newDuration: number;
  }[];
  soundtrackChanged: boolean;
  subtitleDensityModified: boolean;
}

export interface CompositionRecord {
  blueprintId: string;
  metadata: any;
  status: "generated" | "abandoned" | "exported";
  score: number;
  diffs?: EditorialDiff;
  timestamp: number;
}

const MEMORY_KEY = "stretchingpro_composition_memory";

export function getCompositionMemory(): CompositionRecord[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCompositionMemory(memory: CompositionRecord[]) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {}
}

export function recordGeneratedBlueprint(blueprint: any): string {
  const memory = getCompositionMemory();
  const blueprintId =
    blueprint.metadata?.generationSeed ||
    Math.random().toString(36).substring(2, 10);

  const record: CompositionRecord = {
    blueprintId,
    metadata: blueprint.metadata,
    status: "generated",
    score: scoreComposition(blueprint),
    timestamp: Date.now(),
  };

  memory.push(record);
  saveCompositionMemory(memory);
  return blueprintId;
}

export function recordCompositionExport(blueprintId: string) {
  if (!blueprintId) return;
  const memory = getCompositionMemory();
  const index = memory.findIndex((m) => m.blueprintId === blueprintId);
  if (index >= 0) {
    memory[index].status = "exported";
    saveCompositionMemory(memory);
  }
}

export function recordEditorialDiff(blueprintId: string, diff: EditorialDiff) {
  if (!blueprintId) return;
  const memory = getCompositionMemory();
  const index = memory.findIndex((m) => m.blueprintId === blueprintId);
  if (index >= 0) {
    memory[index].diffs = {
      ...(memory[index].diffs || {}),
      ...diff,
    };
    saveCompositionMemory(memory);
  }
}

export function scoreComposition(blueprint: any): number {
  let score = 100;

  // Pacing integrity
  if (blueprint.pacingArc === "steady" || blueprint.pacingArc === "build-up")
    score += 5;

  // Subtitle coherence (density constraints)
  if (blueprint.scenes) {
    blueprint.scenes.forEach((scene: any) => {
      if (scene.script) {
        const words = scene.script.split(/\\s+/).length;
        const wps = words / (scene.duration || 1);
        if (wps > 3.0) score -= 10; // Penalize high cognitive load
        if (wps < 0.5) score -= 5; // Penalize awkward silence structurally
      }
    });
  }

  // Emotional arc restraint
  if (blueprint.transitionRhythm === "fast") score -= 10; // Penalize hyper-activity

  return Math.max(0, Math.min(100, score));
}

export function getLearnedTasteProfile() {
  const memory = getCompositionMemory();
  const exported = memory.filter((m) => m.status === "exported");

  if (exported.length === 0) {
    return {
      preferredPacing: "editorial_steady",
      preferredSubtitles: "minimal_low_density",
      preferredSoundtrack: "ambient_restrained",
      preferredHookProfile: "immediate_authority",
      transitionDensity: "low",
      historicalFatigue: "fresh",
    };
  }

  // Analyze diffs
  let soundtrackChanges = 0;
  let densityReductions = 0;

  exported.forEach((m) => {
    if (m.diffs?.soundtrackChanged) soundtrackChanges++;
    if (m.diffs?.subtitleDensityModified) densityReductions++;
  });

  const prefersCustomSoundtrack = soundtrackChanges > exported.length / 3;
  const prefersLowerCognitiveLoad = densityReductions > 0;

  // Longitudinal Recovery Intelligence
  const recentExports = exported.filter(
    (m) => Date.now() - m.timestamp < 48 * 60 * 60 * 1000,
  ).length;
  let historicalFatigue = "fresh";
  if (recentExports >= 3) historicalFatigue = "accumulated";

  return {
    preferredPacing: prefersLowerCognitiveLoad
      ? "slow_build_editorial"
      : "editorial_steady",
    preferredSubtitles: prefersLowerCognitiveLoad
      ? "ultra_minimal"
      : "minimal_low_density",
    preferredSoundtrack: prefersCustomSoundtrack
      ? "user_overridden_adaptive"
      : "ambient_restrained",
    preferredHookProfile: "immediate_authority",
    transitionDensity: "low",
    historicalFatigue,
  };
}
