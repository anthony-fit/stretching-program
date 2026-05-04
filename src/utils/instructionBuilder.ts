export function buildInstruction(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("hamstring")) {
    return "Keep your back straight, hinge at the hips, and stretch until you feel gentle tension. Do not bounce.";
  }

  if (lower.includes("neck")) {
    return "Move slowly and gently. Do not force the stretch. Keep shoulders relaxed.";
  }

  if (lower.includes("shoulder")) {
    return "Keep your chest open and avoid shrugging. Stretch to a comfortable range only.";
  }

  if (lower.includes("hip") || lower.includes("glute")) {
    return "Maintain steady breathing and avoid twisting your lower back during the stretch.";
  }

  if (lower.includes("back") || lower.includes("spine")) {
    return "Move in a controlled motion. Engage your core lightly and avoid sudden movements.";
  }

  return "Hold the stretch in a controlled position and breathe steadily throughout.";
}

export function buildBreathing(): string {
  return "Breathe in slowly through your nose and out through your mouth. Do not hold your breath.";
}
