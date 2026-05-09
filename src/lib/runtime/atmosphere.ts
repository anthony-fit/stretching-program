import { UserProgression, ReadinessScore } from '../programming';
import { CoachProfile } from '../coaching';

export interface AtmosphereTheme {
  primaryColor: string;
  glowColor: string;
  intensity: number; // 0 to 1
  overlayOpacity: number; // 0 to 1
  ambientStyle: string; // Tailwind classes for background atmosphere
}

export function calculateAtmosphere(
  progression: UserProgression,
  readiness: ReadinessScore,
  coach: CoachProfile,
  phaseName: string,
  journeyName?: string
): AtmosphereTheme {
  // Base atmosphere from coach personality
  let primaryColor = '#fbbf24'; // Default gold
  let glowColor = 'rgba(234, 180, 8, 0.3)';
  let ambientStyle = 'from-gold/5 via-transparent to-transparent';
  let intensity = 0.5;

  // Journey Narrative Overlays
  if (journeyName?.toLowerCase().includes('mobility reset')) {
    ambientStyle = 'from-emerald-500/10 via-charcoal/40 to-transparent backdrop-blur-3xl';
    glowColor = 'rgba(16, 185, 129, 0.2)';
  } else if (journeyName?.toLowerCase().includes('performance')) {
    ambientStyle = 'from-orange-500/10 via-charcoal/40 to-transparent backdrop-blur-3xl';
    glowColor = 'rgba(249, 115, 22, 0.3)';
    intensity = 0.8;
  } else if (journeyName?.toLowerCase().includes('desk')) {
    ambientStyle = 'from-cyan-500/10 via-charcoal/40 to-transparent backdrop-blur-3xl';
    glowColor = 'rgba(6, 182, 212, 0.2)';
  }

  if (coach.personality === 'Recovery') {
    primaryColor = '#60a5fa'; // Blue
    glowColor = 'rgba(96, 165, 250, 0.2)';
    ambientStyle = 'from-blue-500/5 via-transparent to-transparent';
  } else if (coach.personality === 'Mobility') {
    primaryColor = '#34d399'; // Green
    glowColor = 'rgba(52, 211, 153, 0.2)';
    ambientStyle = 'from-green-500/5 via-transparent to-transparent';
  } else if (coach.personality === 'Inspiration') {
    primaryColor = '#f87171'; // Red
    glowColor = 'rgba(248, 113, 113, 0.3)';
    ambientStyle = 'from-red-500/5 via-transparent to-transparent';
  }

  // Adaptive adjustments for readiness
  if (readiness.score < 60) {
    // Dim down and shift to softer tones for recovery
    intensity = 0.3;
    ambientStyle = 'from-blue-400/10 via-charcoal/40 to-transparent backdrop-blur-3xl';
  } else if (readiness.score > 90) {
    // Sharp and energized
    intensity = 0.9;
    ambientStyle = `${ambientStyle} saturate-150 brightness-110`;
  }

  // Phase evolution influence
  if (phaseName?.toLowerCase().includes('foundation')) {
    ambientStyle = `${ambientStyle} opacity-60`;
  } else if (phaseName?.toLowerCase().includes('peak') || phaseName?.toLowerCase().includes('power')) {
    intensity = Math.min(1, intensity + 0.2);
    glowColor = glowColor.replace('0.2)', '0.5)').replace('0.3)', '0.6)');
  }

  return {
    primaryColor,
    glowColor,
    intensity,
    overlayOpacity: intensity * 0.4,
    ambientStyle
  };
}
