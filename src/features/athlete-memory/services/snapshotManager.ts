import { athleteMemoryPersistence } from '../storage/athleteMemoryPersistence';
import { AthleteMemorySnapshot } from '../types';

export const snapshotManager = {
  async takeDailySnapshot(data: Partial<AthleteMemorySnapshot>) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing for today to merge
    const snapshots = await athleteMemoryPersistence.getAllSnapshots();
    const existing = snapshots.find(s => s.id === today);
    
    const snapshot: AthleteMemorySnapshot = {
      id: today,
      date: new Date().toISOString(),
      sessionCompleted: existing?.sessionCompleted || data.sessionCompleted || false,
      sessionDuration: data.sessionDuration ?? existing?.sessionDuration ?? 0,
      sessionFocus: data.sessionFocus || existing?.sessionFocus || 'General',
      recoveryScore: data.recoveryScore ?? existing?.recoveryScore ?? 0,
      hydrationProgress: data.hydrationProgress ?? existing?.hydrationProgress ?? 0,
      calorieAdherence: data.calorieAdherence ?? existing?.calorieAdherence ?? 0,
      fatigueLevel: data.fatigueLevel ?? existing?.fatigueLevel ?? 0,
      preferredVibe: data.preferredVibe || existing?.preferredVibe || 'minimal',
    };
    
    await athleteMemoryPersistence.saveSnapshot(snapshot);
  },
  
  async getAthleteHistory() {
    return await athleteMemoryPersistence.getAllSnapshots();
  }
};
