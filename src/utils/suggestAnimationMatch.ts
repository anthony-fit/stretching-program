import manifest from "../assets/metadata/animation_manifest.json";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function extractKeywords(normalizedName: string): string[] {
  return normalizedName.split("_").filter(k => k.length > 1);
}

function calculateMatchScore(animation: string, keywords: string[]): number {
  let score = 0;
  const normalizedAnimation = animation.toLowerCase();
  for (const keyword of keywords) {
    const animationWords = animation.split("_");
    if (animationWords.some(word => word === keyword)) score += 2;
    else if (normalizedAnimation.includes(keyword)) score += 1;
  }
  return score;
}

/**
 * Yoga animal prefixes - these define the actual pose type
 * bird_dog is NOT downward_dog - they have different prefixes!
 */
const YOGA_ANIMAL_PREFIXES: Record<string, string[]> = {
  dog: ["downward_dog", "upward_dog"],
  cat: ["cat_cow", "cat_pose"],
  cow: ["cow_pose"],
  cobra: ["cobra", "baby_cobra"],
  eagle: ["eagle_pose"],
  pigeon: ["pigeon", "royal_pigeon"]
};

const YOGA_ANIMAL_KEYWORDS = ["dog", "cat", "cow", "cobra", "eagle", "pigeon", "frog", "butterfly"];

function isYogaAnimalPose(keywords: string[]): boolean {
  return keywords.some(k => YOGA_ANIMAL_KEYWORDS.includes(k));
}

function getAnimalKeyword(keywords: string[]): string | null {
  return keywords.find(k => YOGA_ANIMAL_KEYWORDS.includes(k)) || null;
}

/**
 * Check if suggestion starts with a valid yoga animal prefix
 * e.g., "cat_cow_pose" starts with "cat_cow" ?
 * e.g., "bird_dog" does NOT start with any dog prefix ?
 */
function startsWithYogaAnimalPrefix(suggestion: string, animal: string): boolean {
  const prefixes = YOGA_ANIMAL_PREFIXES[animal] || [];
  return prefixes.some(prefix => suggestion.startsWith(prefix));
}

function filterBySemanticGroup(suggestions: string[], keywords: string[]): string[] {
  if (!isYogaAnimalPose(keywords)) return suggestions;

  const inputAnimal = getAnimalKeyword(keywords);
  if (!inputAnimal) return suggestions;

  // Check if any suggestion starts with valid yoga animal prefix
  const validMatches = suggestions.filter(s => startsWithYogaAnimalPrefix(s, inputAnimal));

  if (validMatches.length > 0) {
    console.log(`  VALID ANIMAL MATCHES: Found ${validMatches.length} for ${inputAnimal}`);
    return validMatches;
  }

  // NO valid yoga animal matches exist - return empty
  console.log(`  NO VALID MATCHES: No ${inputAnimal} yoga variations in manifest`);
  return [];
}

export function suggestAnimationMatch(exerciseName: string): string[] {
  const normalizedName = normalizeName(exerciseName);
  const keywords = extractKeywords(normalizedName);

  if (keywords.length === 0) return [];

  const scoredAnimations = manifest.map(animation => ({
    name: animation,
    score: calculateMatchScore(animation, keywords)
  }));

  scoredAnimations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const suggestions = scoredAnimations
    .filter(item => item.score > 0)
    .slice(0, 3)
    .map(item => item.name);

  const filtered = filterBySemanticGroup(suggestions, keywords);

  console.log("SUGGESTED MATCHES:", filtered);
  return filtered;
}
