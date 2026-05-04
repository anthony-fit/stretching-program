const aliases = require('./src/assets/metadata/stretch_frame_aliases.json');
const categories = require('./src/assets/metadata/stretch_categories.json');
const manifest = require('./src/assets/metadata/animation_manifest.json');

// Simulate getAnimationPath logic
const CATEGORY_DEFAULTS = {
  spine: "spine_mobility",
  neck: "neck_mobility",
  shoulder: "shoulder_mobility",
  hip: "hip_mobility",
  hamstring: "forward_fold",
  glutes: "butt_bridge"
};

function animationExists(name) {
  return manifest.includes(name);
}

function getAnimationPath(name) {
  if (!name) return "";

  const normalizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // 1. Exact match check
  if (animationExists(normalizedName)) {
    const result = {
      requested: name,
      normalized: normalizedName,
      selected: normalizedName,
      type: "EXACT"
    };
    console.log(JSON.stringify(result, null, 2));
    return `/animations/${normalizedName}.json`;
  }

  // 2. Alias priority list
  const aliasesMap = aliases;
  const aliasCandidates = aliasesMap[normalizedName] || [];
  for (const candidate of aliasCandidates) {
    if (animationExists(candidate)) {
      const result = {
        requested: name,
        normalized: normalizedName,
        selected: candidate,
        type: "ALIAS"
      };
      console.log(JSON.stringify(result, null, 2));
      return `/animations/${candidate}.json`;
    }
  }

  // 3. Category Fallback
  const categoryMap = categories;
  const category = categoryMap[normalizedName];
  if (category && CATEGORY_DEFAULTS[category]) {
    const candidate = CATEGORY_DEFAULTS[category];
    if (animationExists(candidate)) {
      const result = {
        requested: name,
        normalized: normalizedName,
        selected: candidate,
        type: "CATEGORY"
      };
      console.log(JSON.stringify(result, null, 2));
      return `/animations/${candidate}.json`;
    }
  }

  // 4. Fallback to default
  const result = {
    requested: name,
    normalized: normalizedName,
    selected: "default_stretch",
    type: "FALLBACK"
  };
  console.log(JSON.stringify(result, null, 2));
  return `/animations/default_stretch.json`;
}

console.log('=== REALITY CHECK: Testing new aliases ===\n');

console.log('Test 1: Downward Facing Dog');
getAnimationPath("Downward Facing Dog");

console.log('\nTest 2: Glute Stretch Left');
getAnimationPath("Glute Stretch Left");

console.log('\nTest 3: Glute Stretch Right');
getAnimationPath("Glute Stretch Right");

console.log('\n=== VERIFICATION RESULTS ===');
console.log('✅ All three exercises should show type: "ALIAS"');
console.log('✅ selected values should match our mapped targets');
console.log('✅ No FALLBACK types should appear');
