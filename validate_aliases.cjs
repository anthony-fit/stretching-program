const aliases = require('./src/assets/metadata/stretch_frame_aliases.json');
const manifest = require('./src/assets/metadata/animation_manifest.json');

console.log('=== ALIAS VALIDATION ===\n');

let hasErrors = false;
const validationResults = [];

for (const [aliasKey, targetList] of Object.entries(aliases)) {
  console.log(`Checking alias key: '${aliasKey}'`);
  
  for (const target of targetList) {
    const exists = manifest.includes(target);
    const status = exists ? '✓' : '✗ MISSING';
    console.log(`  → ${status} '${target}'`);
    
    if (!exists) {
      hasErrors = true;
      validationResults.push({
        aliasKey,
        missingTarget: target
      });
    }
  }
}

console.log('\n=== UPDATED ALIAS KEYS ===');
console.log(Object.keys(aliases));

console.log('\n=== VALIDATION SUMMARY ===');
console.log(`Total alias keys: ${Object.keys(aliases).length}`);
console.log(`Total targets: ${Object.values(aliases).reduce((sum, arr) => sum + arr.length, 0)}`);
console.log(`Missing targets: ${validationResults.length}`);

if (hasErrors) {
  console.log('\n❌ VALIDATION FAILED - Missing targets:');
  console.log(JSON.stringify(validationResults, null, 2));
  process.exit(1);
} else {
  console.log('\n✅ VALIDATION PASSED - All alias targets exist in manifest');
}
