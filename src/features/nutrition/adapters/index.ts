import { OpenFoodFactsAdapter } from './OpenFoodFactsAdapter';
import { WGERAdapter } from './WGERAdapter';
import { NutritionSearchResponse, FoodDetailsResponse } from '../types';

const offAdapter = new OpenFoodFactsAdapter();
const wgerAdapter = new WGERAdapter();

export const nutritionApiService = {
  async searchFood(query: string): Promise<NutritionSearchResponse> {
    // Parallel search for speed
    const [offResults, wgerResults] = await Promise.all([
      offAdapter.search(query),
      wgerAdapter.search(query)
    ]);

    const combined = [...wgerResults, ...offResults];
    
    return {
      results: combined,
      total: combined.length,
      page: 1
    };
  },

  async getFoodDetails(id: string): Promise<FoodDetailsResponse | null> {
    if (id.startsWith('off-')) {
      const food = await offAdapter.getDetails(id);
      return food ? { food, source: 'OpenFoodFacts' } : null;
    }
    if (id.startsWith('wger-')) {
      const food = await wgerAdapter.getDetails(id);
      return food ? { food, source: 'WGER' } : null;
    }
    return null;
  }
};
