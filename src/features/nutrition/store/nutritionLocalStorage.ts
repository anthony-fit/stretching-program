import { LOCAL_STORAGE_KEYS } from './storageKeys';
import { NutritionStorageState, NutritionPreferences } from '../types';

export const nutritionLocalStorage = {
  saveState(state: Partial<NutritionStorageState>): void {
    try {
      const existing = this.getState() || {};
      const updated = { ...existing, ...state };
      localStorage.setItem(LOCAL_STORAGE_KEYS.STATE, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  },

  getState(): Partial<NutritionStorageState> | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.STATE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('LocalStorage read failed:', e);
      return null;
    }
  },

  savePreferences(prefs: NutritionPreferences): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  },

  getPreferences(): NutritionPreferences | null {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('LocalStorage read failed:', e);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.STATE);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.VERSION);
  }
};
