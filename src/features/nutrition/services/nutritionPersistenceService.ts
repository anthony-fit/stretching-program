import { nutritionLocalStorage } from '../store/nutritionLocalStorage';
import { nutritionDb } from '../store/nutritionIndexedDB';
import { INDEXED_DB_CONFIG } from '../store/storageKeys';
import { 
  NutritionStorageState, 
  MealEntry, 
  HydrationLog, 
  CaloriesBurnedEntry, 
  BodyMetricEntry,
  DailyMealTimeline
} from '../types';

export const nutritionPersistenceService = {
  // Profile and Settings (LocalStorage)
  async getProfileState(): Promise<Partial<NutritionStorageState>> {
    return nutritionLocalStorage.getState() || {};
  },

  async saveProfileState(state: Partial<NutritionStorageState>): Promise<void> {
    nutritionLocalStorage.saveState(state);
  },

  // Timelines (IndexedDB)
  async saveTimeline(timeline: DailyMealTimeline): Promise<void> {
    await nutritionDb.put(INDEXED_DB_CONFIG.STORES.TIMELINES, timeline);
  },

  async getTimelineByDate(date: string): Promise<DailyMealTimeline | null> {
    const timelines = await nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.TIMELINES) as DailyMealTimeline[];
    return timelines.find(t => t.date === date) || null;
  },

  async getAllTimelines(): Promise<DailyMealTimeline[]> {
    return nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.TIMELINES) as Promise<DailyMealTimeline[]>;
  },

  async deleteTimeline(id: string): Promise<void> {
    await nutritionDb.delete(INDEXED_DB_CONFIG.STORES.TIMELINES, id);
  },

  async activateTimeline(id: string): Promise<void> {
    const timelines = await nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.TIMELINES) as DailyMealTimeline[];
    const timeline = timelines.find(t => t.id === id);
    if (timeline) {
      timeline.isActive = true;
      await this.saveTimeline(timeline);
    }
  },

  // Logs (IndexedDB)
  async logMeal(meal: MealEntry): Promise<void> {
    await nutritionDb.put(INDEXED_DB_CONFIG.STORES.MEALS, meal);
  },

  async getMeals(): Promise<MealEntry[]> {
    return nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.MEALS);
  },

  async logHydration(log: HydrationLog): Promise<void> {
    await nutritionDb.put(INDEXED_DB_CONFIG.STORES.HYDRATION, log);
  },

  async getHydrationLogs(): Promise<HydrationLog[]> {
    return nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.HYDRATION);
  },

  async logCaloriesBurned(entry: CaloriesBurnedEntry): Promise<void> {
    await nutritionDb.put(INDEXED_DB_CONFIG.STORES.CALORIES_BURNED, entry);
  },

  async getCaloriesBurnedHistory(): Promise<CaloriesBurnedEntry[]> {
    return nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.CALORIES_BURNED);
  },

  async logBodyMetric(entry: BodyMetricEntry): Promise<void> {
    await nutritionDb.put(INDEXED_DB_CONFIG.STORES.BODY_METRICS, entry);
  },

  async deleteMeal(id: string): Promise<void> {
    await nutritionDb.delete(INDEXED_DB_CONFIG.STORES.MEALS, id);
  },

  async getBodyMetricHistory(): Promise<BodyMetricEntry[]> {
    return nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.BODY_METRICS);
  },

  // Export/Import
  async exportData(): Promise<string> {
    const state = nutritionLocalStorage.getState();
    const meals = await this.getMeals();
    const hydration = await this.getHydrationLogs();
    const caloriesBurned = await this.getCaloriesBurnedHistory();
    const bodyMetrics = await this.getBodyMetricHistory();
    const timelines = await nutritionDb.getAll(INDEXED_DB_CONFIG.STORES.TIMELINES);

    const backup = {
      version: 1,
      timestamp: Date.now(),
      data: {
        state,
        meals,
        hydration,
        caloriesBurned,
        bodyMetrics,
        timelines
      }
    };

    return JSON.stringify(backup);
  },

  async importData(json: string): Promise<void> {
    try {
      const backup = JSON.parse(json);
      if (backup.data.state) {
        nutritionLocalStorage.saveState(backup.data.state);
      }
      
      // Bulk import to IndexedDB (simple implementation)
      if (backup.data.meals) {
        for (const meal of backup.data.meals) await this.logMeal(meal);
      }
      if (backup.data.hydration) {
        for (const h of backup.data.hydration) await this.logHydration(h);
      }
      if (backup.data.caloriesBurned) {
        for (const c of backup.data.caloriesBurned) await this.logCaloriesBurned(c);
      }
      if (backup.data.bodyMetrics) {
        for (const b of backup.data.bodyMetrics) await this.logBodyMetric(b);
      }
      if (backup.data.timelines) {
        for (const t of backup.data.timelines) await this.saveTimeline(t);
      }
    } catch (e) {
      console.error('Import failed:', e);
      throw new Error('Invalid backup format');
    }
  }
};
