import { METActivity } from '../types';

export const MET_ACTIVITIES: METActivity[] = [
  // Stretching & Mobility
  { id: 'stretching-static', name: 'Static Stretching (Hatha Yoga type)', metValue: 2.5, category: 'stretching' },
  { id: 'stretching-dynamic', name: 'Dynamic Stretching', metValue: 3.5, category: 'stretching' },
  { id: 'yoga-gentle', name: 'Gentle Yoga', metValue: 2.3, category: 'yoga' },
  { id: 'yoga-power', name: 'Power Yoga / Vinyasa', metValue: 4.0, category: 'yoga' },
  { id: 'mobility-circles', name: 'Joint Mobility Drills', metValue: 2.0, category: 'mobility' },
  
  // Walking & Daily
  { id: 'walking-slow', name: 'Walking (Slow, 2 mph)', metValue: 2.0, category: 'walking' },
  { id: 'walking-brisk', name: 'Walking (Brisk, 3.5 mph)', metValue: 4.3, category: 'walking' },
  
  // Cardio & Intensity
  { id: 'cardio-low', name: 'Low Intensity Cardio', metValue: 5.0, category: 'cardio' },
  { id: 'cardio-moderate', name: 'Moderate Intensity Cardio', metValue: 7.0, category: 'cardio' },
  
  // Strength & Recovery
  { id: 'strength-bodyweight', name: 'Bodyweight Calisthenics', metValue: 3.8, category: 'strength' },
  { id: 'strength-weights', name: 'Resistance Training (Weights)', metValue: 5.0, category: 'strength' },
  { id: 'recovery-foam-rolling', name: 'Foam Rolling / Self-Massage', metValue: 1.8, category: 'recovery' }
];
