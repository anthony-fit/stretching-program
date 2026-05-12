import { UserMetrics } from '../types';
import { NUTRITION_CONSTRAINTS } from './mathUtils';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateUserMetrics(metrics: Partial<UserMetrics>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!metrics.age || metrics.age < NUTRITION_CONSTRAINTS.MIN_AGE || metrics.age > NUTRITION_CONSTRAINTS.MAX_AGE) {
    errors.age = `Age must be between ${NUTRITION_CONSTRAINTS.MIN_AGE} and ${NUTRITION_CONSTRAINTS.MAX_AGE}`;
  }

  if (!metrics.weight || metrics.weight < NUTRITION_CONSTRAINTS.MIN_WEIGHT || metrics.weight > NUTRITION_CONSTRAINTS.MAX_WEIGHT) {
    errors.weight = `Weight must be between ${NUTRITION_CONSTRAINTS.MIN_WEIGHT} and ${NUTRITION_CONSTRAINTS.MAX_WEIGHT} kg`;
  }

  if (!metrics.height || metrics.height < NUTRITION_CONSTRAINTS.MIN_HEIGHT || metrics.height > NUTRITION_CONSTRAINTS.MAX_HEIGHT) {
    errors.height = `Height must be between ${NUTRITION_CONSTRAINTS.MIN_HEIGHT} and ${NUTRITION_CONSTRAINTS.MAX_HEIGHT} cm`;
  }

  if (!metrics.gender) {
    errors.gender = 'Gender is required';
  }

  if (!metrics.activityLevel) {
    errors.activityLevel = 'Activity level is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
