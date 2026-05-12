import { AthleteStreak } from '../types';

const STREAK_KEY = 'stretching_pro_athlete_streaks';

export const streakEngine = {
  getStreaks(): AthleteStreak {
    const saved = localStorage.getItem(STREAK_KEY);
    if (!saved) {
      return {
        hydrationCount: 0,
        mobilityCount: 0,
        nutritionLogCount: 0,
        recoveryCheckInCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    return JSON.parse(saved);
  },

  updateStreaks(updates: Partial<AthleteStreak>): void {
    const current = this.getStreaks();
    const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  },

  // Logic to calculate streaks based on logs
  incrementMobilityStreak(): void {
    const streaks = this.getStreaks();
    const today = new Date().toDateString();
    const lastUpdate = new Date(streaks.lastUpdated).toDateString();
    
    if (today !== lastUpdate) {
      this.updateStreaks({ mobilityCount: streaks.mobilityCount + 1 });
    }
  },

  incrementHydrationStreak(): void {
    const streaks = this.getStreaks();
    const today = new Date().toDateString();
    const lastUpdate = new Date(streaks.lastUpdated).toDateString();
    
    if (today !== lastUpdate) {
      this.updateStreaks({ hydrationCount: streaks.hydrationCount + 1 });
    }
  },

  incrementNutritionStreak(): void {
    const streaks = this.getStreaks();
    const today = new Date().toDateString();
    const lastUpdate = new Date(streaks.lastUpdated).toDateString();
    
    if (today !== lastUpdate) {
      this.updateStreaks({ nutritionLogCount: streaks.nutritionLogCount + 1 });
    }
  },

  incrementRecoveryStreak(): void {
    const streaks = this.getStreaks();
    const today = new Date().toDateString();
    const lastUpdate = new Date(streaks.lastUpdated).toDateString();
    
    if (today !== lastUpdate) {
      this.updateStreaks({ recoveryCheckInCount: streaks.recoveryCheckInCount + 1 });
    }
  }
};
