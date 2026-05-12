/**
 * Calculates daily hydration target in liters.
 * Base recommendation: ~33ml per kg of body weight.
 */
export function calculateHydration(weightKg: number): number {
  // Base: 33ml/kg
  const baseLiters = weightKg * 0.033;
  
  // Return rounded to 1 decimal place, minimum 1.5L
  return Math.max(1.5, Math.round(baseLiters * 10) / 10);
}
