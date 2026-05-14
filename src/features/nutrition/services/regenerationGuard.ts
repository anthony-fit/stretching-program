import { nutritionPersistenceService } from './nutritionPersistenceService';

export interface RegenerationGuardState {
  canRegenerate: boolean;
  cooldownRemaining?: number; // ms
  remainingDailyBudget: number;
  isRateLimited: boolean;
}

const GLOBAL_DAILY_LIMIT = 15;
const SLOT_REGEN_LIMIT = 5;
const COOLDOWN_MS = 60000; // 1 minute between rapid bursts

export const regenerationGuard = {
  async checkStatus(slotIdx: number, currentDailyCount: number): Promise<RegenerationGuardState> {
    const timelines = await nutritionPersistenceService.getAllTimelines();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTimeline = timelines.find(t => t.date === todayStr);

    const slot = todayTimeline?.slots[slotIdx];
    const slotRegens = slot?.regenerationCount || 0;

    // Check Slot Limit
    if (slotRegens >= SLOT_REGEN_LIMIT) {
       return {
         canRegenerate: false,
         remainingDailyBudget: GLOBAL_DAILY_LIMIT - currentDailyCount,
         isRateLimited: false
       };
    }

    // Check Daily Limit
    if (currentDailyCount >= GLOBAL_DAILY_LIMIT) {
       return {
         canRegenerate: false,
         remainingDailyBudget: 0,
         isRateLimited: true
       };
    }

    // Cooldown logic (simulated with recent timestamp if we tracked it)
    // For now, simplicity first as per instructions
    
    return {
      canRegenerate: true,
      remainingDailyBudget: GLOBAL_DAILY_LIMIT - currentDailyCount,
      isRateLimited: false
    };
  }
};
