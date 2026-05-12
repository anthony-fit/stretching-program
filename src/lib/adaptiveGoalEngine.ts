import { Exercise } from "../data/exercises";
import { StoryboardItem } from "./biomechanicalAnalyzer";

export function applyAdaptiveGoalEngine(
  items: StoryboardItem[],
  allExercises: Exercise[],
  wizardConfig: any,
): {
  items: StoryboardItem[];
  addedScripts: { exerciseName: string; script: string }[];
  intelligenceLogs: string[];
} {
  if (items.length === 0)
    return { items, addedScripts: [], intelligenceLogs: [] };

  let adapted: StoryboardItem[] = [...items];
  const addedScripts: { exerciseName: string; script: string }[] = [];
  const intelligenceLogs: string[] = [];

  const goal = (wizardConfig?.type || "").toLowerCase();
  const focus = (wizardConfig?.focus || "").toLowerCase();

  const isFatBurn =
    goal.includes("fat burn") ||
    goal.includes("weight loss") ||
    goal.includes("hiit");
  const isCardio = goal.includes("cardio");
  const isMobility =
    goal.includes("mobility") ||
    goal.includes("recovery") ||
    goal.includes("stretching");
  const isStrength = goal.includes("strength") || goal.includes("functional");
  const isPosture = goal.includes("posture") || focus.includes("posture");

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

  const getCardio = () =>
    getReplacement([
      "jump",
      "burpee",
      "sprint",
      "climber",
      "jack",
      "high knee",
    ]) || allExercises[0];
  const getDecompression = () =>
    getReplacement(["child", "cobra", "stretch", "reach", "relax"]) ||
    allExercises[0];
  const getCoreOrMobility = () =>
    getReplacement(["plank", "twist", "rotation"]) || allExercises[0];
  const getStrength = () =>
    getReplacement(["squat", "lunge", "deadlift", "push"]) || allExercises[0];

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
    addedScripts.push({
      exerciseName: newItem.name,
      script: scriptMsg,
    });
  };

  const insertAfter = (
    idx: number,
    newItem: Exercise,
    duration: number,
    scriptMsg: string,
  ) => {
    adapted.splice(idx + 1, 0, {
      ...newItem,
      duration,
      baseDuration: duration,
      instanceId: Math.random().toString(36).substr(2, 9),
    } as StoryboardItem);
    addedScripts.push({
      exerciseName: newItem.name,
      script: scriptMsg,
    });
  };

  // 1. FAT BURN / HIIT (Metabolic pacing, cardio bursts)
  if (isFatBurn) {
    const logMsg = "Fat burn pacing activated";
    console.log(`[GOAL ENGINE] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Inject cardio bursts every 4th movement if not already intense
    for (let i = 3; i < adapted.length; i += 4) {
      if (
        !["jump", "burpee", "sprint", "climber"].some((t) =>
          adapted[i].name.toLowerCase().includes(t),
        )
      ) {
        const cardio = getCardio();
        if (cardio) {
          pushReplaced(
            i,
            cardio,
            30,
            `Push the pace with ${cardio.name}! Keep that heart rate up.`,
          );
        }
      }
    }
  }

  // 2. CARDIO CONDITIONING (Heart-rate continuity, rhythmic chains)
  if (isCardio) {
    const logMsg = "Cardio continuity enforced";
    console.log(`[GOAL ENGINE] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    adapted = adapted.map((item) => {
      // Reduce overly long durations to keep things moving
      if (item.duration > 45) {
        return { ...item, duration: 45, baseDuration: 45 };
      }
      return item;
    });
  }

  // 3. MOBILITY / RECOVERY (Decompression, slow pacing)
  if (isMobility) {
    const logMsg = "Recovery cadence increased";
    console.log(`[GOAL ENGINE] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    adapted = adapted.map((item, index) => {
      // Increase durations for deeper stretching
      let newDuration = item.duration;
      if (
        item.category.toLowerCase().includes("stretching") ||
        item.category.toLowerCase().includes("mobility")
      ) {
        newDuration = Math.max(item.duration, 60);
      }
      return { ...item, duration: newDuration, baseDuration: newDuration };
    });

    // Ensure every 5th exercise is pure decompression
    for (let i = 4; i < adapted.length; i += 5) {
      const dec = getDecompression();
      if (dec)
        pushReplaced(
          i,
          dec,
          60,
          `Deep breath into ${dec.name}. Let the nervous system downregulate.`,
        );
    }
  }

  // 4. STRENGTH / FUNCTIONAL (Load alternation, activation before intensity)
  if (isStrength) {
    const logMsg = "Strength / Functional load alternation activated";
    console.log(`[GOAL ENGINE] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Ensure 2nd exercise is activation (core or mobility) before heavy loads
    if (adapted.length > 2) {
      const act = getCoreOrMobility();
      if (act)
        pushReplaced(
          1,
          act,
          45,
          `Activate the core with ${act.name} before we load the main movements.`,
        );
    }
  }

  // 5. POSTURE CORRECTION (Anti-compression, spinal decompression)
  if (isPosture) {
    const logMsg = "Posture decompression inserted";
    console.log(`[GOAL ENGINE] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Inject shoulder mobility / chest openers
    let postureInjected = false;
    for (let i = Math.floor(adapted.length / 2); i < adapted.length; i++) {
      const postureEx = getReplacement([
        "shoulder",
        "reach",
        "chest",
        "posture",
      ]);
      if (postureEx && !postureInjected) {
        insertAfter(
          i,
          postureEx,
          45,
          `Posture reset: open up the chest and shoulders with ${postureEx.name}.`,
        );
        postureInjected = true;
        break;
      }
    }
  }

  // 6. LONG-FORM SESSION ARCHITECTURE WAVES
  if (adapted.length >= 10) {
    if (isFatBurn || isStrength || isCardio) {
      const logMsg = "Intensity peak wave enforced for long session";
      console.log(`[GOAL ENGINE] ${logMsg}`);
      intelligenceLogs.push(logMsg);
      // Ensure the middle section has a peak
      const midIdx = Math.floor(adapted.length / 2);
      const peak = isStrength ? getStrength() : getCardio();
      if (peak)
        pushReplaced(
          midIdx,
          peak,
          40,
          `We've reached the peak of the workout. Give it everything on ${peak.name}!`,
        );
    }
  }

  return { items: adapted, addedScripts, intelligenceLogs };
}
