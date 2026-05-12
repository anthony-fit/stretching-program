import { NutritionVendorAdapter, normalizeNutrient } from './NutritionVendorAdapter';
import { FoodItem, FoodSearchResult } from '../types';

export class OpenFoodFactsAdapter implements NutritionVendorAdapter {
  private baseUrl = 'https://world.openfoodfacts.org';

  async search(query: string): Promise<FoodSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
      const data = await response.json();
      
      return (data.products || []).map((p: any) => ({
        id: `off-${p.code || p._id}`,
        name: p.product_name || 'Unknown Product',
        brand: p.brands,
        calories: normalizeNutrient(p.nutriments?.['energy-kcal_100g'] || (p.nutriments?.energy_100g ? p.nutriments.energy_100g / 4.184 : 0)),
        protein: normalizeNutrient(p.nutriments?.proteins_100g),
        carbs: normalizeNutrient(p.nutriments?.carbohydrates_100g),
        fat: normalizeNutrient(p.nutriments?.fat_100g),
        source: 'off',
        image: p.image_front_thumb_url
      }));
    } catch (e) {
      console.error('OFF Search Error:', e);
      return [];
    }
  }

  async getDetails(id: string): Promise<FoodItem | null> {
    const code = id.replace('off-', '');
    try {
      const response = await fetch(`${this.baseUrl}/api/v0/product/${code}.json`);
      const data = await response.json();
      if (!data.product) return null;

      const p = data.product;
      return {
        id: id,
        name: p.product_name || 'Unknown Product',
        brand: p.brands,
        calories: normalizeNutrient(p.nutriments?.['energy-kcal_100g']),
        protein: normalizeNutrient(p.nutriments?.proteins_100g),
        carbs: normalizeNutrient(p.nutriments?.carbohydrates_100g),
        fat: normalizeNutrient(p.nutriments?.fat_100g),
        servingSize: 100,
        servingUnit: 'g'
      };
    } catch (e) {
      return null;
    }
  }
}
