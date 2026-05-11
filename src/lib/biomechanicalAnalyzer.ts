import { Exercise } from "../data/exercises";

export interface StoryboardItem extends Exercise {
  duration: number;
  baseDuration: number;
  instanceId: string;
  reason?: string;
}

// 2. ADD MOVEMENT CLASSIFICATIONS
// Extend exercise intelligence metadata using deterministic mappings.
export const MOVEMENT_CLASSIFIERS: Record<
  string,
  { tags: string[]; loadScore: "low" | "moderate" | "high" }
> = {
  "spinal flexion": { tags: ["spinal flexion", "core"], loadScore: "moderate" },
  "spinal extension": {
    tags: ["spinal extension", "core", "decompression"],
    loadScore: "low",
  },
  rotation: { tags: ["rotation", "core", "mobility"], loadScore: "moderate" },
  "anti-rotation": {
    tags: ["anti-rotation", "core", "stability"],
    loadScore: "high",
  },
  "hip hinge": {
    tags: ["hip hinge", "lower body", "strength"],
    loadScore: "high",
  },
  "shoulder mobility": {
    tags: ["shoulder mobility", "upper body", "recovery"],
    loadScore: "low",
  },
  decompression: {
    tags: ["decompression", "recovery", "stretching"],
    loadScore: "low",
  },
  "balance/stability": {
    tags: ["balance/stability", "core"],
    loadScore: "moderate",
  },
  explosive: { tags: ["explosive", "power", "cardio"], loadScore: "high" },
  recovery: {
    tags: ["recovery", "nervous system downregulation", "stretching"],
    loadScore: "low",
  },
};

// Heuristic to classify existing exercises
export function getModifiers(ex: Exercise): {
  tags: string[];
  loadScore: "low" | "moderate" | "high";
} {
  const name = ex.name.toLowerCase();
  const cat = (ex.category || "").toLowerCase();
  const tags = new Set<string>();
  let loadScore: "low" | "moderate" | "high" = "moderate";

  if (
    name.includes("crunch") ||
    name.includes("situp") ||
    name.includes("sit-up") ||
    name.includes("flexion")
  ) {
    tags.add("spinal flexion");
  }
  if (
    name.includes("cobra") ||
    name.includes("extension") ||
    name.includes("superman") ||
    name.includes("bridge")
  ) {
    tags.add("spinal extension");
    tags.add("decompression");
    loadScore = "low";
  }
  if (name.includes("twist") || name.includes("rotation")) {
    tags.add("rotation");
  }
  if (
    name.includes("plank") ||
    name.includes("hold") ||
    name.includes("isometric")
  ) {
    tags.add("anti-rotation");
    tags.add("balance/stability");
    loadScore = "moderate";
  }
  if (
    name.includes("deadlift") ||
    name.includes("hinge") ||
    name.includes("swing") ||
    name.includes("good morning")
  ) {
    tags.add("hip hinge");
    loadScore = "high";
  }
  if (
    name.includes("squat") ||
    name.includes("lunge") ||
    name.includes("jump")
  ) {
    loadScore = "high";
    if (name.includes("jump")) tags.add("explosive");
  }
  if (
    name.includes("shoulder") ||
    name.includes("arm circle") ||
    name.includes("reach") ||
    name.includes("scapular")
  ) {
    tags.add("shoulder mobility");
    if (cat.includes("mobility")) loadScore = "low";
  }
  if (
    cat.includes("stretching") ||
    cat.includes("recovery") ||
    cat.includes("mobility") ||
    name.includes("child")
  ) {
    tags.add("recovery");
    tags.add("decompression");
    loadScore = "low";
  }
  if (
    cat.includes("hiit") ||
    cat.includes("cardio") ||
    name.includes("burpee") ||
    name.includes("sprint") ||
    name.includes("mountain climber")
  ) {
    tags.add("explosive");
    loadScore = "high";
  }

  return { tags: Array.from(tags), loadScore };
}

export function analyzeAndBalanceRoutine(
  items: StoryboardItem[],
  allExercises: Exercise[],
): {
  items: StoryboardItem[];
  addedScripts: { exerciseName: string; script: string }[];
  intelligenceLogs: string[];
} {
  if (items.length === 0)
    return { items, addedScripts: [], intelligenceLogs: [] };

  let balanced: StoryboardItem[] = [];
  let addedScripts: { exerciseName: string; script: string }[] = [];
  let intelligenceLogs: string[] = [];
  let flexCount = 0;
  let highLoadCount = 0;
  let shoulderLoadCount = 0;
  let hamstringLoadCount = 0;

  const getReplacement = (tags: string[]): Exercise | null => {
    const potentials = allExercises.filter((ex) => {
      const mod = getModifiers(ex);
      return tags.some((t) => mod.tags.includes(t));
    });
    return potentials.length > 0
      ? potentials[Math.floor(Math.random() * potentials.length)]
      : null;
  };

  const getDecompression = () =>
    getReplacement(["decompression", "recovery"]) ||
    allExercises.find((ex) => ex.name.includes("Child")) ||
    allExercises[0];
  const getCoreOrMobility = () =>
    getReplacement(["balance/stability", "shoulder mobility", "rotation"]) ||
    allExercises[0];

  const pushAdded = (item: StoryboardItem) => {
    balanced.push(item);
    addedScripts.push({
      exerciseName: item.name,
      script: `Focus on controlled movement here. Transition into ${item.name} and ease any tension.`,
    });
  };

  items.forEach((item, index) => {
    const modifiers = getModifiers(item);
    const isHighLoad = modifiers.loadScore === "high";

    // Rule A: Too many spinal flexion exercises in sequence -> insert decompression
    if (modifiers.tags.includes("spinal flexion")) {
      flexCount++;
      if (flexCount >= 3) {
        const dec = getDecompression();
        if (dec) {
          const logMsg =
            "Excess spinal flexion detected. Inserting decompression.";
          console.log(`[BIOMECH] ${logMsg}`);
          intelligenceLogs.push(logMsg);
          pushAdded({
            ...dec,
            duration: 30,
            baseDuration: 30,
            instanceId: Math.random().toString(36).substr(2, 9),
          } as StoryboardItem);
        }
        flexCount = 0;
      }
    } else {
      flexCount = 0;
    }

    // Rule B & D: Hamstring loading & Shoulder loading
    if (
      modifiers.tags.includes("hip hinge") ||
      (item.targetMuscles || []).some((m) =>
        m.toLowerCase().includes("hamstring"),
      )
    ) {
      hamstringLoadCount++;
      if (hamstringLoadCount >= 3) {
        const rep = getCoreOrMobility();
        if (rep) {
          const logMsg = "Balanced upper/lower loading (Hamstring relief).";
          console.log(`[BIOMECH] ${logMsg}`);
          intelligenceLogs.push(logMsg);
          pushAdded({
            ...rep,
            duration: 45,
            baseDuration: 45,
            instanceId: Math.random().toString(36).substr(2, 9),
          } as StoryboardItem);
        }
        hamstringLoadCount = 0;
      }
    }

    // Rule C: HIIT pacing too dense -> enforce recovery cadence
    // Rule 4: Fatigue-aware sequencing
    if (isHighLoad) {
      highLoadCount++;
      if (highLoadCount >= 3) {
        // 3 high loads in a row
        const rec = getDecompression();
        if (rec) {
          const logMsg = "HIIT density reduced / Recovery phase injected.";
          console.log(`[BIOMECH] ${logMsg}`);
          intelligenceLogs.push(logMsg);
          pushAdded({
            ...rec,
            duration: 45,
            baseDuration: 45,
            instanceId: Math.random().toString(36).substr(2, 9),
          } as StoryboardItem);
        }
        highLoadCount = 0;
      }
    } else {
      highLoadCount = 0;
    }

    balanced.push(item);
  });

  // Rule E: Long-form 30m sessions -> enforce pacing wave structure
  // We'll approximate long-form by length >= 15 items
  if (balanced.length >= 15) {
    const logMsg = "Enforcing pacing wave structure for long-form session.";
    console.log(`[BIOMECH] ${logMsg}`);
    intelligenceLogs.push(logMsg);
    // Ensure the first item is low load (activation)
    if (getModifiers(balanced[0]).loadScore !== "low") {
      const act =
        getReplacement(["recovery", "shoulder mobility"]) || allExercises[0];
      if (act) {
        balanced[0] = {
          ...act,
          duration: 60,
          baseDuration: 60,
          instanceId: Math.random().toString(36).substr(2, 9),
        } as StoryboardItem;
        addedScripts.push({
          exerciseName: act.name,
          script: `Let's start slowly with ${act.name} to activate the body.`,
        });
      }
    }
    // Ensure the last item is recovery (cooldown)
    if (getModifiers(balanced[balanced.length - 1]).loadScore !== "low") {
      const cool = getDecompression();
      if (cool) {
        balanced[balanced.length - 1] = {
          ...cool,
          duration: 60,
          baseDuration: 60,
          instanceId: Math.random().toString(36).substr(2, 9),
        } as StoryboardItem;
        addedScripts.push({
          exerciseName: cool.name,
          script: `Great effort today. Let's cool down gently with ${cool.name}.`,
        });
      }
    }
  }

  return { items: balanced, addedScripts, intelligenceLogs };
}
