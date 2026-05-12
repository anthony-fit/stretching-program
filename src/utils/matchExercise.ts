export function normalize(str: string) {
  if (!str) return "";
  let base = str
    .toString()
    .toLowerCase()
    .replace(/['’]s\b/g, "") // child's -> child
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\b(left|right|stretch|pose|hold|drill)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  if (!base) {
     // If the entire string was "right stretch", fallback to original alphanumeric
     base = str
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return base;
}

export function resolveVerifiedExercise(
  aiSuggestedName: string,
  exercises: any[],
  fallbackCategory?: string,
  fallbackFocus?: string
): any | null {
  if (!exercises || exercises.length === 0) return null;

  const dbArrayToMap = exercises.reduce((acc, ex) => {
    acc[ex.name] = ex.id;
    return acc;
  }, {} as Record<string, string>);

  const bestMatchName = findBestMatch(aiSuggestedName, dbArrayToMap);
  let match = bestMatchName ? exercises.find(ex => ex.name === bestMatchName) : null;

  if (match) {
    console.log(`[VERIFIED] Matched exercise: "${aiSuggestedName}" -> "${match.name}"`);
    return match;
  }

  // If no match found, use deterministic fallback
  const fallbackPool = exercises.filter(ex => {
    let isValid = true;
    if (fallbackCategory) {
      isValid = isValid && ex.category?.toLowerCase() === fallbackCategory.toLowerCase();
    }
    if (fallbackFocus) {
      isValid = isValid && ex.focus?.some((f: string) => f.toLowerCase().includes(fallbackFocus.toLowerCase()));
    }
    return isValid;
  });

  const poolToUse = fallbackPool.length > 0 ? fallbackPool : exercises;
  
  // Deterministic fallback based on input string to ensure consistency
  let hash = 0;
  for (let i = 0; i < aiSuggestedName.length; i++) {
    hash = aiSuggestedName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const deterministicIndex = Math.abs(hash) % poolToUse.length;
  const deterministicReplacement = poolToUse[deterministicIndex];

  console.log(`[REPLACED] Unsupported AI exercise swapped: "${aiSuggestedName}" -> "${deterministicReplacement.name}"`);
  return deterministicReplacement;
}
export function findBestMatch(name: string, db: Record<string, string>): string | null {
  // First, check explicit exact full-string aliases before we heavily normalize
  const rawInput = name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const explicitAliases: Record<string, string> = {
    "cat cow stretch": "cat cow pose",
    "cat cow": "cat cow pose",
    "cat and cow": "cat cow pose",
    "downward dog": "downward facing dog",
    "down dog": "downward facing dog",
    "downward facing dog pose": "downward facing dog",
    "childs pose": "childs pose",
    "child pose": "childs pose",
    "cross body shoulder stretch": "shoulder stretch",
    "crossbody shoulder stretch": "shoulder stretch",
    "glute bridge": "bridge",
    "glute bridges": "bridge",
    "butt lift": "bridge",
    "bridges": "bridge",
    "sit ups": "abdominal crunches",
    "sit up": "abdominal crunches",
    "push up": "push ups",
    "pushup": "push ups",
    "pushups": "push ups",
    "jumping jack": "jumping jacks",
    "lunge": "lunges",
    "squat": "squats",
    "side plank": "side plank right"
  };

  let searchTarget = explicitAliases[rawInput] || rawInput;

  let input = normalize(searchTarget);

  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const key in db) {
    const targetRaw = key.toLowerCase();
    const target = normalize(key);
    
    // Direct raw match bypasses arbitrary scoring algorithms
    if (searchTarget === targetRaw) {
        return key;
    }

    let score = 0;

    if (input === target) score += 100;

    if (input.includes(target) || target.includes(input)) {
      score += 50;
    }

    // partial word match
    const inputWords = input.split(" ");
    const targetWords = target.split(" ");

    const common = inputWords.filter(word => targetWords.includes(word));
    score += common.length * 15;

    // Favor shorter target strings (less specific means more generic match)
    score -= targetWords.length; 

    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  return bestScore > 25 ? bestMatch : null;
}
