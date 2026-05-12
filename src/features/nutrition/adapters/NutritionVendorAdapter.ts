import { FoodItem, FoodSearchResult } from '../types';

export interface NutritionVendorAdapter {
  search(query: string): Promise<FoodSearchResult[]>;
  getDetails(id: string): Promise<FoodItem | null>;
}

export function normalizeNutrient(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.round(num * 10) / 10;
}
