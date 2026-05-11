import fs from "fs";

function processFile(path: string) {
  let content = fs.readFileSync(path, 'utf8');

  // Convert raw console into tagged logs
  content = content.replace(/console\.error\("Failed to load recovery memory",/g, 'console.error("[MEMORY] Failed to load recovery memory",');
  content = content.replace(/console\.error\("Failed to save memory",/g, 'console.error("[MEMORY] Failed to save memory",');
  content = content.replace(/console\.error\("LLM PARSE ERROR:",/g, 'console.error("[AI] LLM PARSE ERROR:",');
  content = content.replace(/console\.error\("LLM INTENT PARSE ERROR:",/g, 'console.error("[AI] LLM INTENT PARSE ERROR:",');

  fs.writeFileSync(path, content, 'utf8');
}

processFile('src/pages/HomePage.tsx');
processFile('src/server/services/groq.ts');
console.log("Cleaned other files");
