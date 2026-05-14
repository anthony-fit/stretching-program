import { safeFetch } from '../../../lib/network/safeFetch';
import { MealGenerationContext } from './buildMealGenerationContext';

export interface GeneratedMeal {
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
}

export const mealGenerationService = {
  async generateMeals(context: MealGenerationContext): Promise<{ meals: GeneratedMeal[] }> {
    const data = await safeFetch('/api/ai/generate-meal', {
      method: 'POST',
      body: JSON.stringify({ context }),
      timeoutMs: 20000
    });
    return data as any;
  },
  
  async generateMealTimeline(context: any): Promise<any> {
    const data = await safeFetch('/api/ai/generate-meal-timeline', {
      method: 'POST',
      body: JSON.stringify({ context }),
      timeoutMs: 20000
    });
    return data as any;
  }
};
