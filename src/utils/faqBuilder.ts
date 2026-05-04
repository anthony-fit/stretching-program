export function buildFAQs(name: string, modifier?: string) {
  const base = [
    {
      q: `How often should you do the ${name} stretch?`,
      a: `You can perform the ${name} stretch 3 to 5 times per week depending on your flexibility goals.`
    },
    {
      q: `How long should you hold the ${name} stretch?`,
      a: `Hold the ${name} stretch for 15 to 60 seconds while maintaining steady breathing.`
    }
  ];

  if (modifier) {
    base.push({
      q: `Is the ${name} stretch good for ${modifier}?`,
      a: `Yes, the ${name} stretch can help improve ${modifier} when performed consistently with proper form.`
    });
  }

  return base;
}
