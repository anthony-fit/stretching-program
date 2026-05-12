/**
 * Ensures a value is a valid number, providing a fallback if not.
 */
export const safeNumber = (value: any, fallback: number = 0): number => {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Constrains a number between min and max.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Unit normalization helpers.
 */
export const normalizeUnits = {
  lbsToKg: (lbs: number) => lbs * 0.453592,
  kgToLbs: (kg: number) => kg / 0.453592,
  inchesToCm: (inches: number) => inches * 2.54,
  cmToInches: (cm: number) => cm / 2.54,
};

export const NUTRITION_CONSTRAINTS = {
  MIN_AGE: 13,
  MAX_AGE: 120,
  MIN_WEIGHT: 30, // kg
  MAX_WEIGHT: 300, // kg
  MIN_HEIGHT: 100, // cm
  MAX_HEIGHT: 250, // cm
};
