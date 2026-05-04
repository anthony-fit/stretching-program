const manifest = require('./src/assets/metadata/animation_manifest.json');
const categories = require('./src/assets/metadata/stretch_categories.json');

// List of failing exercises (from user report)
const failingExercises = [
  'Downward Facing Dog',
  'Glute Stretch Left',
  'Glute Stretch Right'
];

// Normalization function (same as getAnimationPath.ts)
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Find closest matches using includes
function findMatches(normalized, manifest) {
  // Extract keywords from normalized name
  const keywords = normalized.split('_').filter(k => k.length > 0);
  
  // Search for matches in manifest
  const matches = manifest.filter(item => {
    return keywords.some(keyword => item.includes(keyword));
  }).sort((a, b) => {
    // Sort by number of keyword matches
    const aMatches = keywords.filter(k => a.includes(k)).length;
    const bMatches = keywords.filter(k => b.includes(k)).length;
    return bMatches - aMatches;
  });
  
  return matches;
}

console.log('=== MISSING ANIMATION MAPPINGS ANALYSIS ===\n');

const missingMappings = failingExercises.map(exercise => {
  const normalized = normalize(exercise);
  const matches = findMatches(normalized, manifest);
  const category = categories[normalized];
  
  return {
    exercise,
    normalized,
    category: category || null,
    suggestions: matches.slice(0, 8),  // Top 8 matches
    totalMatches: matches.length
  };
});

console.log(JSON.stringify({ missingMappings }, null, 2));

// Also show all related manifest entries
console.log('\n=== RELATED MANIFEST ENTRIES ===');
console.log('\nAll "glute" related animations:');
const gluteAnimations = manifest.filter(a => a.includes('glute'));
console.log(gluteAnimations);

console.log('\nAll "dog" related animations:');
const dogAnimations = manifest.filter(a => a.includes('dog'));
console.log(dogAnimations);

console.log('\nAll "downward" related animations:');
const downwardAnimations = manifest.filter(a => a.includes('downward'));
console.log(downwardAnimations);

console.log('\nAll yoga/stretch related ("pose", "stretch", "yoga"):');
const yogaAnimations = manifest.filter(a => a.includes('pose') || a.includes('yoga') || a.includes('fold'));
console.log(yogaAnimations);
