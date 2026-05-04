import fs from "fs";
import path from "path";

const animationsDir = path.join(process.cwd(), "public/animations");

const folders = fs.readdirSync(animationsDir).filter(name => {
  const fullPath = path.join(animationsDir, name);

  if (!fs.statSync(fullPath).isDirectory()) return false;

  const files = fs.readdirSync(fullPath);

  // VALID if contains:
  // - frame images OR
  // - .json manifest

  const hasFrames = files.some(f => f.endsWith(".webp") || f.endsWith(".png"));
  const hasJson = files.some(f => f.endsWith(".json"));

  return hasFrames || hasJson;
});

fs.mkdirSync(path.join(process.cwd(), "src/assets/metadata"), { recursive: true });
fs.writeFileSync(
  path.join(process.cwd(), "src/assets/metadata/animation_manifest.json"),
  JSON.stringify(folders, null, 2)
);

console.log("VALID ANIMATIONS:", folders);
