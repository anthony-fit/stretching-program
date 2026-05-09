/**
 * Motion Governance System
 * Centralized transition classes for unified pacing across the movement OS.
 * Prevents motion entropy and maintains premium cinematic elegance.
 */

export const EASE = {
  /** Slow, deliberate orchestration easing for major conceptual shifts */
  cinematic: [0.16, 1, 0.3, 1],
  /** Standard UX layout and navigation easing */
  system: [0.25, 1, 0.5, 1],
  /** Snappy, tactile response for small micro-interactions */
  micro: [0.17, 0.67, 0.3, 1],
} as const;

export const DURATION = {
  micro: 0.18,
  system: 0.45,
  cinematic: 0.9,
  ambientBase: 4.0,
} as const;

export const SPRING = {
  micro: { type: "spring", stiffness: 450, damping: 35 },
  system: { type: "spring", stiffness: 300, damping: 30 },
} as const;

export const transitionClasses = {
  cinematic: { duration: DURATION.cinematic, ease: EASE.cinematic },
  system: { duration: DURATION.system, ease: EASE.system },
  micro: { duration: DURATION.micro, ease: EASE.micro },
};

/**
 * Common motion variants to ensure consistency
 */
export const V = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  fadeUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 }
  }
};
