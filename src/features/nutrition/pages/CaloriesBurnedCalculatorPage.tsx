import React, { useState, useEffect } from 'react';
import { NutritionHeader } from '../components/NutritionHeader';
import { MET_ACTIVITIES } from '../data/metActivities';
import { calculateCaloriesBurned } from '../calculators/calculateCaloriesBurned';
import { nutritionPersistenceService } from '../services/nutritionPersistenceService';
import { METActivity, CaloriesBurnedEntry } from '../types';
import { Flame, Clock, Scale, Plus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CaloriesBurnedCalculatorPage() {
  const [selectedActivity, setSelectedActivity] = useState<METActivity>(MET_ACTIVITIES[0]);
  const [duration, setDuration] = useState<any>(30);
  const [weight, setWeight] = useState<any>(70);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadWeight() {
      const state = await nutritionPersistenceService.getProfileState();
      if (state.profile?.weight) {
        setWeight(state.profile.weight);
      }
    }
    loadWeight();
  }, []);

  const totalBurned = calculateCaloriesBurned(selectedActivity.metValue, Number(weight) || 0, Number(duration) || 0);

  const handleLogActivity = async () => {
    const entry: CaloriesBurnedEntry = {
      id: crypto.randomUUID(),
      activityId: selectedActivity.id,
      activityName: selectedActivity.name,
      durationMinutes: Number(duration) || 0,
      calories: totalBurned,
      timestamp: Date.now()
    };

    await nutritionPersistenceService.logCaloriesBurned(entry);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <NutritionHeader title="Calorie Burn" showBack />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gold/10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mx-auto mb-4">
              <Flame className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif font-medium text-charcoal">Activity Calculator</h2>
            <p className="text-charcoal/60 mt-1">Estimate your energy expenditure</p>
          </div>

          <div className="space-y-6">
            {/* Activity Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">Select Activity</label>
              <select
                value={selectedActivity.id}
                onChange={(e) => {
                  const activity = MET_ACTIVITIES.find(a => a.id === e.target.value);
                  if (activity) setSelectedActivity(activity);
                }}
                className="w-full bg-cream/50 border border-charcoal/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all appearance-none text-lg font-medium text-charcoal"
              >
                {MET_ACTIVITIES.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">Duration (min)</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                    className="w-full bg-cream/50 border border-charcoal/10 rounded-2xl pl-14 pr-6 py-4 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-xl font-bold text-charcoal"
                    min="1"
                    max="480"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">Your Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                    className="w-full bg-cream/50 border border-charcoal/10 rounded-2xl pl-14 pr-6 py-4 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-xl font-bold text-charcoal"
                    min="30"
                    max="300"
                  />
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-charcoal text-cream rounded-3xl p-8 text-center mt-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <div className="relative z-10">
                <span className="text-xs font-medium text-gold uppercase tracking-[0.2em] block mb-2">Estimated Burn</span>
                <div className="text-6xl font-black tracking-tighter mb-2">{totalBurned}</div>
                <div className="text-sm font-medium text-cream/40 uppercase tracking-widest">Calories</div>
               </div>
            </div>

            <button 
              onClick={handleLogActivity}
              disabled={isSuccess}
              className={`w-full font-bold uppercase tracking-widest py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isSuccess ? 'bg-green-500 text-white' : 'bg-gold text-charcoal hover:bg-gold/90'
              }`}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Logged to Profile</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Save to History</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* MET Info */}
        <div className="mt-8 bg-gold/5 rounded-2xl p-6 border border-gold/10">
          <p className="text-xs text-charcoal/60 leading-relaxed italic">
            *This calculation uses Metabolic Equivalent of Task (MET) values. Actual results may vary based on intensity, metabolism, and environmental factors.
          </p>
        </div>
      </main>
    </div>
  );
}
