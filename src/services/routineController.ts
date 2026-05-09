import { StretchRoutine } from '../types/stretch';
import { generateLocalRoutine } from './localRoutineService';

export async function generateRoutine(
  level: string,
  focusArea: string,
  duration: number,
  wgerExercises: any[] = []
): Promise<StretchRoutine> {
  console.log("Engine Used: Local Only (AI Disabled)");

  const result = generateLocalRoutine(level, focusArea, duration, wgerExercises);
  if (result) result.duration = duration;

  return result;
}
