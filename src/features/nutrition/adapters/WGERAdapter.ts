import { NutritionVendorAdapter, normalizeNutrient } from './NutritionVendorAdapter';
import { FoodItem, FoodSearchResult } from '../types';

export class WGERAdapter implements NutritionVendorAdapter {
  private baseUrl = 'https://wger.de/api/v2';

  async search(query: string): Promise<FoodSearchResult[]> {
    try {
      // WGER ingredient search
      const response = await fetch(`${this.baseUrl}/ingredient/search/?term=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      return (data.suggestions || []).map((s: any) => ({
        id: `wger-${s.data.id}`,
        name: s.value,
        brand: 'Generic',
        calories: normalizeNutrient(s.data.energy),
        protein: normalizeNutrient(s.data.protein),
        carbs: normalizeNutrient(s.data.carbohydrates),
        fat: normalizeNutrient(s.data.fat),
        source: 'wger'
      }));
    } catch (e) {
      console.error('WGER Search Error:', e);
      return [];
    }
  }

  async getDetails(id: string): Promise<FoodItem | null> {
    const wgerId = id.replace('wger-', '');
    try {
      const response = await fetch(`${this.baseUrl}/ingredient/${wgerId}/`);
      const data = await response.json();
      
      return {
        id: id,
        name: data.name,
        calories: normalizeNutrient(data.energy),
        protein: normalizeNutrient(data.protein),
        carbs: normalizeNutrient(data.carbohydrates),
        fat: normalizeNutrient(data.fat),
        servingSize: 100,
        servingUnit: 'g'
      };
    } catch (e) {
      return null;
    }
  }
}
