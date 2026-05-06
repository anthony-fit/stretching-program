import { VERIFIED_EXERCISES } from "../src/constants/exercises";
import manifest from "../src/assets/metadata/animation_manifest.json";
import aliases from "../src/assets/metadata/stretch_frame_aliases.json";
import { suggestAnimationMatch } from "../src/utils/suggestAnimationMatch";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

const newAliases: Record<string, string[]> = {};
let totalMissing = 0;
let totalSkipped = 0;
let totalNoMatch = 0;

for (const exerciseName of Object.keys(VERIFIED_EXERCISES)) {
  const normalized = normalizeName(exerciseName);
  
  if (manifest.includes(normalized)) {
    totalSkipped++;
    continue;
  }
  
  const existingAliases = aliases as Record<string, string[]>;
  if (existingAliases[normalized]) {
    totalSkipped++;
    continue;
  }
  
  totalMissing++;
  
  const suggestions = suggestAnimationMatch(exerciseName);
  
  // Skip if no valid semantic match
  if (suggestions.length === 0) {
    console.log("SKIPPED (no valid semantic match):", exerciseName);
    totalNoMatch++;
    continue;
  }
  
  const top2 = suggestions.slice(0, 2);
  newAliases[normalized] = top2;
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total exercises: ${Object.keys(VERIFIED_EXERCISES).length}`);
console.log(`Skipped (already mapped): ${totalSkipped}`);
console.log(`Missing mappings found: ${totalMissing}`);
console.log(`Skipped (no valid match): ${totalNoMatch}`);
console.log(`Generated aliases: ${Object.keys(newAliases).length}`);

console.log("\nAUTO GENERATED ALIASES:");
console.log(JSON.stringify(newAliases, null, 2));
