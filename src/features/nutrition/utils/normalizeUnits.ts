/**
 * Unit conversion utilities for Nutrition and Fitness.
 */
export const lbsToKg = (lbs: number): number => lbs * 0.453592;
export const kgToLbs = (kg: number): number => kg / 0.453592;
export const inchesToCm = (inches: number): number => inches * 2.54;
export const cmToInches = (cm: number): number => cm / 2.54;

/**
 * Normalizes user input into internal metric values.
 */
export function normalizeToMetric(value: number, unit: 'lb' | 'kg' | 'in' | 'cm'): number {
  switch (unit) {
    case 'lb': return lbsToKg(value);
    case 'in': return inchesToCm(value);
    default: return value;
  }
}
