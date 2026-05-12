import React, { useState, useEffect } from 'react';
import { NutritionHeader } from '../components/NutritionHeader';
import { calculateBMR } from '../calculators/calculateBMR';
import { calculateTDEE } from '../calculators/calculateTDEE';
import { calculateMacroTargets } from '../calculators/calculateMacroTargets';
import { calculateHydration } from '../calculators/calculateHydration';
import { nutritionPersistenceService } from '../services/nutritionPersistenceService';
import { Goal, NutritionProfile, UserMetrics } from '../types';
import { Calculator, Target, Zap, Waves, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function MacroCalculatorPage() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [goal, setGoal] = useState<Goal>('maintenance');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const state = await nutritionPersistenceService.getProfileState();
      if (state.profile) {
        setMetrics(state.profile);
        setGoal(state.profile.goal);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        {!isLoading && !metrics ? (
            <div className="text-center">
                <p className="text-charcoal/60 mb-4">No metrics found. Please set your stats first.</p>
                <a href="/nutrition" className="text-gold font-bold underline">Go to Dashboard</a>
            </div>
        ) : (
            <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        )}
      </div>
    );
  }

  const bmr = calculateBMR(metrics);
  const tdee = calculateTDEE(metrics);
  
  // Adjusted Calories based on goal
  let targetCalories = tdee;
  if (goal === 'fat_loss') targetCalories = tdee - 500;
  if (goal === 'muscle_gain') targetCalories = tdee + 250;

  const macros = calculateMacroTargets(targetCalories, goal, metrics.weight);
  const hydration = calculateHydration(metrics.weight);

  const goalConfigs: { id: Goal; label: string; icon: any; desc: string }[] = [
    { id: 'fat_loss', label: 'Fat Loss', icon: Zap, desc: 'Prioritize protein to maintain muscle while in a deficit.' },
    { id: 'maintenance', label: 'Maintenance', icon: Target, desc: 'Steady energy levels for consistent training.' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: TrendingUp, desc: 'Moderate surplus to support lean tissue growth.' },
    { id: 'wellness', label: 'Wellness', icon: ShieldCheck, desc: 'Balanced nutrition for optimal health and longevity.' },
    { id: 'recovery', label: 'Recovery', icon: Waves, desc: 'Higher fat and protein to support joint and tissue repair.' },
  ];

  function TrendingUp(props: any) {
    return (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <NutritionHeader title="Macro Blueprint" showBack />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Goal Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-medium text-charcoal px-2">Select Your Objective</h2>
            <div className="space-y-3">
              {goalConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => setGoal(config.id)}
                  className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    goal === config.id 
                    ? 'bg-charcoal text-cream border-gold shadow-lg transform scale-[1.02]' 
                    : 'bg-white text-charcoal border-gold/10 hover:border-gold/40'
                  }`}
                >
                  <div className={`mt-1 p-2 rounded-lg ${goal === config.id ? 'bg-gold/20 text-gold' : 'bg-cream text-charcoal/40'}`}>
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                       {config.label}
                       {goal === config.id && <ShieldCheck className="w-4 h-4 text-gold" />}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${goal === config.id ? 'text-cream/60' : 'text-charcoal/40'}`}>
                      {config.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Results Display */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
               key={goal}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white rounded-3xl p-8 shadow-xl border border-gold/10"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-charcoal/30 uppercase tracking-[0.2em] block mb-2">Daily Budget</span>
                  <div className="text-7xl font-black text-charcoal tracking-tighter">{targetCalories}<span className="text-xl text-charcoal/40 ml-2">kcal</span></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cream/40 rounded-2xl px-6 py-4 border border-gold/5">
                        <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest block mb-1">BMR</span>
                        <span className="text-xl font-bold text-charcoal">{Math.round(bmr)}</span>
                    </div>
                    <div className="bg-cream/40 rounded-2xl px-6 py-4 border border-gold/5">
                        <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest block mb-1">TDEE</span>
                        <span className="text-xl font-bold text-charcoal">{Math.round(tdee)}</span>
                    </div>
                </div>
              </div>

              {/* Macro Bars */}
              <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <h3 className="text-lg font-serif font-medium">Protein Architecture</h3>
                      <span className="text-2xl font-bold text-gold">{macros.protein}g</span>
                   </div>
                   <div className="h-4 w-full bg-cream rounded-full overflow-hidden">
                      <div className="h-full bg-gold transition-all duration-700" style={{ width: '30%' }} />
                   </div>
                   <p className="text-xs text-charcoal/40">Essential for muscle retention and satiety while pursuing {goal.replace('_', ' ')}.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <h3 className="text-lg font-serif font-medium">Carbohydrate Fuel</h3>
                      <span className="text-2xl font-bold text-charcoal">{macros.carbs}g</span>
                   </div>
                   <div className="h-4 w-full bg-cream rounded-full overflow-hidden">
                      <div className="h-full bg-charcoal transition-all duration-700" style={{ width: '45%' }} />
                   </div>
                   <p className="text-xs text-charcoal/40">Optimized to support your activity level without excessive energy spillover.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <h3 className="text-lg font-serif font-medium">Fat (Hormonal Balance)</h3>
                      <span className="text-2xl font-bold text-charcoal/60">{macros.fat}g</span>
                   </div>
                   <div className="h-4 w-full bg-cream rounded-full overflow-hidden">
                      <div className="h-full bg-charcoal/20 transition-all duration-700" style={{ width: '25%' }} />
                   </div>
                   <p className="text-xs text-charcoal/40">Healthy fats to support cellular health and endocrine function.</p>
                </div>
              </div>

              <div className="mt-12 p-6 bg-blue-50/30 rounded-2xl border border-blue-100 flex items-center gap-6">
                <div className="bg-white p-3 rounded-xl text-blue-500 shadow-sm">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                   <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest block mb-1">Hydration Strategy</span>
                   <p className="text-sm font-medium text-charcoal">Recommended target of <span className="font-bold text-blue-600">{hydration} Liters</span> per day based on {metrics.weight}kg bodyweight.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
