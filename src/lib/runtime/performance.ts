/**
 * Performance Budget Governance
 * Defines explicit ceilings for environmental complexity under load.
 * Premium UX relies on controlled restraint, never exceeding hardware capability.
 */

export const PERFORMANCE_BUDGETS = {
  /** Maximum number of concurrent ambient animations allowed */
  maxConcurrentAmbientAnimations: 3,
  
  /** Maximum allowable blur radius (px) to prevent expensive GPU rendering on mobile */
  maxBlurRadiusPx: 24,
  
  /** Maximum number of overlapping background gradients */
  maxLayeredGradients: 3,
  
  /** Maximum active requestAnimationFrame loops */
  maxActiveRAFLoops: 1,
  
  /** Restraint on shadow complexity (number of layered shadows) */
  maxShadowComplexity: 2,
  
  /** Maximum simultaneous orchestrated transitions */
  maxSimultaneousTransitions: 4,
} as const;

/**
 * Checks if the current environment can handle high-fidelity rendering.
 * Can be expanded to use hardware concurrency or memory API if available.
 */
export function getFidelityLevel(): 'high' | 'medium' | 'low' {
  // Simple heuristic baseline for now. Can be expanded based on window height, etc.
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 768) {
      return 'medium'; // Mobile devices
    }
  }
  return 'high'; // Desktop environments
}
