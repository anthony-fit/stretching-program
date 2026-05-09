export type CoachPersonality = 'Performance' | 'Recovery' | 'Mobility' | 'Inspiration' | 'Zen' | 'Technical';

export interface CoachProfile {
  id: string;
  name: string;
  personality: CoachPersonality;
  tagline: string;
  philosophy: string;
  tone: string;
  pacing: 'Dynamic' | 'Steady' | 'Calm';
  subtitleStyle: {
    color: string;
    font: string;
    background: string;
  };
  introHookStyle: string;
  signature: string;
}

export const COACH_PROFILES: CoachProfile[] = [
  {
    id: 'performance-pro',
    name: 'Atlas',
    personality: 'Performance',
    tagline: 'Precision and Power.',
    philosophy: 'I focus on the structural mechanics of high-quality movement. Every rep is an investment in your future strength.',
    tone: 'Confident, results-oriented, high-energy, performance-focused.',
    pacing: 'Dynamic',
    subtitleStyle: {
      color: '#fbbf24', // Gold
      font: 'font-mono',
      background: 'bg-charcoal/80'
    },
    introHookStyle: 'Challenge-focused and direct.',
    signature: 'Driven by Performance.'
  },
  {
    id: 'recovery-guide',
    name: 'Luna',
    personality: 'Recovery',
    tagline: 'Heal and Restore.',
    philosophy: 'Movement should be a dialogue with your body, not an argument. We prioritize nervous system regulation and deep restoration.',
    tone: 'Empathetic, soothing, restorative, focus on nervous system regulation.',
    pacing: 'Steady',
    subtitleStyle: {
      color: '#60a5fa', // Blue
      font: 'font-sans',
      background: 'bg-charcoal/40'
    },
    introHookStyle: 'Breath-focused and grounding.',
    signature: 'Guided by Recovery.'
  },
  {
    id: 'mobility-mentor',
    name: 'Sage',
    personality: 'Mobility',
    tagline: 'Flow without Limits.',
    philosophy: 'Range of motion is the foundation of longevity. We build fluid, adaptable strength that serves you in every environment.',
    tone: 'Educational, focused on longevity, movement flow, and anatomical awareness.',
    pacing: 'Steady',
    subtitleStyle: {
      color: '#34d399', // Green
      font: 'font-sans',
      background: 'bg-black/60'
    },
    introHookStyle: 'Structural and flow-oriented.',
    signature: 'Movement for Longevity.'
  },
  {
    id: 'intense-motivator',
    name: 'Jaxon',
    personality: 'Inspiration',
    tagline: 'Break Your Limits.',
    philosophy: 'Plateaus are just temporary boundaries. We use intensity to redefine what you think is possible today.',
    tone: 'Aggressively motivating, high energy, punchy, focused on grit.',
    pacing: 'Dynamic',
    subtitleStyle: {
      color: '#f87171', // Red
      font: 'font-black',
      background: 'bg-red-900/40'
    },
    introHookStyle: 'High-energy and boundary-pushing.',
    signature: 'No Limits.'
  }
];
