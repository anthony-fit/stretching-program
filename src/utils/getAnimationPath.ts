import aliases from "../assets/metadata/stretch_frame_aliases.json";
import categories from "../assets/metadata/stretch_categories.json";
import manifest from "../assets/metadata/animation_manifest.json";

function animationExists(name: string): boolean {
  return manifest.includes(name);
}

const CATEGORY_DEFAULTS: Record<string, string> = {
  spine: "spine_mobility",
  neck: "neck_mobility",
  shoulder: "shoulder_mobility",
  hip: "hip_mobility",
  hamstring: "forward_fold",
  glutes: "butt_bridge"
};

export function getAnimationPath(name: string): string {
  if (!name) return "";

  const normalizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // 1. Exact match check
  if (animationExists(normalizedName)) {
    console.log("ANIMATION MATCH:", {
      requested: name,
      normalized: normalizedName,
      selected: normalizedName,
      type: "EXACT"
    });
    return `/animations/${normalizedName}.json`;
  }

  // 2. Alias priority list
  const aliasesMap = aliases as Record<string, string[]>;
  const aliasCandidates = aliasesMap[normalizedName] || [];
  for (const candidate of aliasCandidates) {
    if (animationExists(candidate)) {
      console.log("ANIMATION MATCH:", {
        requested: name,
        normalized: normalizedName,
        selected: candidate,
        type: "ALIAS"
      });
      return `/animations/${candidate}.json`;
    }
  }

  // 3. Category Fallback
  const categoryMap = categories as Record<string, string>;
  const category = categoryMap[normalizedName];
  if (category && CATEGORY_DEFAULTS[category]) {
    const candidate = CATEGORY_DEFAULTS[category];
    if (animationExists(candidate)) {
      console.log("ANIMATION MATCH:", {
        requested: name,
        normalized: normalizedName,
        selected: candidate,
        type: "CATEGORY"
      });
      return `/animations/${candidate}.json`;
    }
  }

  // Final Fallback (either a default stretch or the normalized name which will fail gracefully)
  // We return a path that includes /animations/ and .json as per Step 16 requirements.
  const finalFallback = "default_stretch"; 
  
  const selectedMatch = animationExists(normalizedName) ? normalizedName 
                       : (aliasCandidates.find(c => animationExists(c)) || 
                          ((category && CATEGORY_DEFAULTS[category] && animationExists(CATEGORY_DEFAULTS[category])) ? CATEGORY_DEFAULTS[category] : null));

  const result = selectedMatch || (animationExists(finalFallback) ? finalFallback : normalizedName);

  console.log("ANIMATION MATCH:", {
    requested: name,
    normalized: normalizedName,
    selected: result,
    type: selectedMatch ? (selectedMatch === normalizedName ? "EXACT" : (aliasCandidates.includes(selectedMatch) ? "ALIAS" : "CATEGORY")) : "FALLBACK"
  });

  return `/animations/${result}.json`;
}
