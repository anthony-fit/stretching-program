import { Exercise } from "../data/exercises";
import { StoryboardItem } from "./biomechanicalAnalyzer";
import { getModifiers } from "./biomechanicalAnalyzer";

const MEMORY_KEY = "stretchingpro_progressive_memory_v1";

interface SessionMemory {
  date: string;
  type: string;
  intensity: string;
  durationMinutes: number;
  dominantTags: string[];
  loadScoreAvg: number; // e.g. 1 (low) to 3 (high)
}

function getMemory(): SessionMemory[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not load progressive memory", e);
  }
  return [];
}

function saveMemory(history: SessionMemory[]) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(history.slice(-10))); // keep last 10
  } catch (e) {
    console.warn("Could not save progressive memory", e);
  }
}

export function recordCompletedSession(items: StoryboardItem[], config: any) {
  if (!items || items.length === 0) return;

  const tagCounts: Record<string, number> = {};
  let totalLoad = 0;

  items.forEach((item) => {
    const mods = getModifiers(item);
    mods.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
    let loadValue = 2; // moderate
    if (mods.loadScore === "high") loadValue = 3;
    if (mods.loadScore === "low") loadValue = 1;
    totalLoad += loadValue;
  });

  const loadScoreAvg = totalLoad / items.length;

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((e) => e[0]);

  const record: SessionMemory = {
    date: new Date().toISOString(),
    type: config.type || "Unknown",
    intensity: config.intensity || "Medium",
    durationMinutes: Math.floor(
      items.reduce((acc, curr) => acc + curr.duration, 0) / 60,
    ),
    dominantTags: sortedTags,
    loadScoreAvg,
  };

  const history = getMemory();
  history.push(record);
  saveMemory(history);
  console.log("[MEMORY] Logged session to progressive memory:", record);
}

export function applyProgressiveAdaptation(
  items: StoryboardItem[],
  scripts: { exerciseName: string; script: string }[],
  allExercises: Exercise[],
  wizardConfig: any,
): {
  items: StoryboardItem[];
  scripts: { exerciseName: string; script: string }[];
  intelligenceLogs: string[];
} {
  const history = getMemory();
  if (history.length === 0 || items.length === 0)
    return { items, scripts, intelligenceLogs: [] };

  const lastSession = history[history.length - 1];
  let adapted = [...items];
  let adaptedScripts = [...scripts];
  const intelligenceLogs: string[] = [];

  const getReplacement = (
    tags: string[],
    requireCategory?: string,
  ): Exercise | null => {
    const potentials = allExercises.filter((ex) => {
      const name = ex.name.toLowerCase();
      const cat = (ex.category || "").toLowerCase();
      if (requireCategory && !cat.includes(requireCategory)) return false;
      const hasTag = tags.some((t) => name.includes(t) || cat.includes(t));
      return hasTag;
    });
    return potentials.length > 0
      ? potentials[Math.floor(Math.random() * potentials.length)]
      : null;
  };

  const pushReplaced = (
    idx: number,
    newItem: Exercise,
    duration: number,
    scriptMsg: string,
  ) => {
    adapted[idx] = {
      ...newItem,
      duration,
      baseDuration: duration,
      instanceId: Math.random().toString(36).substr(2, 9),
    } as StoryboardItem;
    // Replace script synchronously instead of appending
    if (idx < adaptedScripts.length) {
      adaptedScripts[idx] = { exerciseName: newItem.name, script: scriptMsg };
    } else {
      adaptedScripts.push({ exerciseName: newItem.name, script: scriptMsg });
    }
  };

  // Rule A: Recent high HIIT density -> increase recovery cadence next session
  if (
    lastSession.loadScoreAvg > 2.2 &&
    (wizardConfig.type || "").toLowerCase().includes("hiit")
  ) {
    const logMsg = "Fatigue balancing injected (Recent high load detected)";
    console.log(`[MEMORY] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Increase recovery density
    const rec =
      getReplacement(["recovery", "decompression"]) ||
      allExercises.find((ex) => ex.name.includes("Child"));
    if (rec && adapted.length > 3) {
      pushReplaced(
        Math.floor(adapted.length / 2),
        rec,
        60,
        `Let's take a longer recovery break here. Your body worked hard in the last session.`,
      );
    }
  }

  // Rule B: Repeated hamstring/hip loading
  if (
    lastSession.dominantTags.includes("hip hinge") ||
    lastSession.dominantTags.includes("explosive")
  ) {
    const logMsg = "High posterior-chain load detected from previous session";
    console.log(`[MEMORY] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    const mob = getReplacement(["shoulder mobility", "decompression"]);
    if (mob && adapted.length > 2) {
      pushReplaced(
        1,
        mob,
        45,
        `Balancing out your previous intense lower body loading with some targeted mobility.`,
      );
    }
  }

  // Rule C: Repeated spinal flexion patterns
  if (lastSession.dominantTags.includes("spinal flexion")) {
    const logMsg = "High spinal flexion load detected";
    console.log(`[MEMORY] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    const ext = getReplacement(["spinal extension"]);
    if (ext && adapted.length > 1) {
      pushReplaced(
        Math.floor(adapted.length / 3),
        ext,
        45,
        `Focusing on extension to counter your recent spinal flexion work.`,
      );
    }
  }

  // Rule D: Repeated recovery sessions -> gradually reintroduce activation intensity
  if (
    lastSession.loadScoreAvg < 1.5 &&
    (wizardConfig.type || "").toLowerCase().includes("recovery")
  ) {
    const logMsg = "Progressive activation restored";
    console.log(`[MEMORY] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    const act = getReplacement(["balance/stability", "core"]);
    if (act && adapted.length > 2) {
      pushReplaced(
        Math.floor(adapted.length / 2),
        act,
        45,
        `Adding a little stability challenge since you recovered well recently.`,
      );
    }
  }

  // Rule E: Back-to-back high load sessions -> reduce explosive density
  const lastTwo = history.slice(-2);
  if (lastTwo.length >= 2 && lastTwo.every((s) => s.loadScoreAvg >= 2.0)) {
    const logMsg =
      "Recovery modulation increased (Back-to-back heavy sessions)";
    console.log(`[MEMORY] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Replace 1 high load item with decompression
    const highLoadIdx = adapted.findIndex(
      (it) => getModifiers(it).loadScore === "high",
    );
    if (highLoadIdx !== -1) {
      const dec = getReplacement(["decompression"]) || allExercises[0];
      pushReplaced(
        highLoadIdx,
        dec,
        45,
        `Swapping out high intensity for active recovery here. Your body needs to downregulate.`,
      );
    }
  }

  return { items: adapted, scripts: adaptedScripts, intelligenceLogs };
}
