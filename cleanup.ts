import fs from "fs";

function processFile(path: string) {
  let content = fs.readFileSync(path, 'utf8');

  // Convert raw console into tagged logs
  content = content.replace(/console\.error\("Failed to load exercises:",/g, 'console.error("[PIPELINE] Failed to load exercises:",');
  content = content.replace(/console\.warn\("Failed to restore autosave",/g, 'console.warn("[PIPELINE] Failed to restore autosave:",');
  content = content.replace(/console\.warn\("Autosave failed\. Quota exceeded or error:",/g, 'console.warn("[PIPELINE] Autosave failed:",');
  content = content.replace(/console\.error\("Local fallback also failed:",/g, 'console.error("[FALLBACK] Local fallback also failed:",');
  content = content.replace(/console\.error\("AI script generation failed:",/g, 'console.error("[AI] AI script generation failed:",');
  content = content.replace(/console\.error\("Video generation failed:",/g, 'console.error("[EXPORT] Video generation failed:",');
  content = content.replace(/console\.error\("Failed to generate SEO metadata",/g, 'console.error("[EXPORT] Failed to generate SEO metadata:",');
  content = content.replace(/console\.error\("Error closing AudioContext:",/g, 'console.error("[AudioEngine] Error closing AudioContext:",');
  content = content.replace(/console\.error\("Could not lazily track export",/g, 'console.error("[EXPORT] Could not lazily track export",');

  // Remove console.debug entirely
  const lines = content.split('\n');
  const res = [];
  let skip = false;
  for (let line of lines) {
    if (line.includes('console.debug(')) {
      if (line.includes(');')) {
        skip = false;
      } else {
        skip = true;
      }
      continue;
    }
    if (skip) {
      if (line.includes(');')) {
        skip = false;
      }
      continue;
    }
    res.push(line);
  }

  fs.writeFileSync(path, res.join('\n'), 'utf8');
}

processFile('src/pages/VideoStudioPage.tsx');
console.log("Cleaned VideoStudioPage logs");
