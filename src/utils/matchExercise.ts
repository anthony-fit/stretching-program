export function normalize(str: string) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBestMatch(name: string, db: Record<string, string>): string | null {
  let input = normalize(name);

  // Apply known easy aliases before matching
  const aliases: Record<string, string> = {
    "cat cow stretch": "cat cow pose"
  };
  if (aliases[input]) {
    input = aliases[input];
  }

  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const key in db) {
    const target = normalize(key);

    let score = 0;

    if (input === target) score += 100;

    if (input.includes(target) || target.includes(input)) {
      score += 50;
    }

    // partial word match
    const inputWords = input.split(" ");
    const targetWords = target.split(" ");

    const common = inputWords.filter(word => targetWords.includes(word));
    score += common.length * 15;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  return bestScore > 25 ? bestMatch : null;
}
