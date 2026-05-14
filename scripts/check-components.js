// simple script
const fs = require('fs');

const code = fs.readFileSync('src/pages/VideoStudioPage.tsx', 'utf-8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Match things like `MyComponent(` or `props.MyComponent(` but not `React.memo(` or `React.lazy(`
  let match = line.match(/\b([A-Z][a-zA-Z0-9]*)\s*\(/);
  if (match) {
    const fnName = match[1];
    // Exclude common NON-React component uppercase functions 
    // And exclude classes like `URL`, `Array`, `String`, etc
    if (!['String', 'Number', 'Boolean', 'URL', 'Date', 'Promise', 'Math', 'Array', 'Object', 'Error', 'Set', 'Map', 'Intl'].includes(fnName)) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
}
