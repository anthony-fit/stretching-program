/**
 * Calculates Calories Burned based on MET values.
 * Formula: Calories = (MET * Weight_in_kg * Time_in_hours)
 */
export function calculateCaloriesBurned(metValue: number, weightKg: number, durationMinutes: number): number {
  const durationHours = durationMinutes / 60;
  return Math.round(metValue * weightKg * durationHours);
}
