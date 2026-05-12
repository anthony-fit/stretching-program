import React from 'react';
import { Flame, Droplets, Target, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AthleteStreak } from '../types';

interface HabitStreakCardProps {
  streaks: AthleteStreak;
}

export function HabitStreakCard({ streaks }: HabitStreakCardProps) {
  const habits = [
    { label: 'Mobility', count: streaks.mobilityCount, icon: <Activity className="w-5 h-5" />, color: 'text-gold' },
    { label: 'Hydration', count: streaks.hydrationCount, icon: <Droplets className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Nutrition', count: streaks.nutritionLogCount, icon: <Target className="w-5 h-5" />, color: 'text-emerald-400' },
    { label: 'Recovery', count: streaks.recoveryCheckInCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-cream' },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40">Consistency Engine</h3>
        <Flame className="w-5 h-5 text-gold" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {habits.map((habit, idx) => (
          <div key={idx} className="space-y-4 text-center group">
            <div className={`w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all ${habit.color}`}>
              {habit.icon}
            </div>
            <div>
              <div className="text-2xl font-serif italic font-bold text-white mb-1">
                {habit.count}d
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-cream/30">
                {habit.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10">
        <p className="text-[10px] font-medium text-gold/80 leading-relaxed italic text-center">
          "Consistency is the only non-negotiable metric for elite performance."
        </p>
      </div>
    </div>
  );
}
