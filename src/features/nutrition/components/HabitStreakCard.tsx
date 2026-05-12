import React from 'react';
import { Calendar, Award } from 'lucide-react';

interface HabitStreakCardProps {
  days: number;
}

export function HabitStreakCard({ days }: HabitStreakCardProps) {
  return (
    <div className="bg-gold/5 border border-gold/10 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gold border border-gold/10 relative">
          <Calendar className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-charcoal text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
            {days}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-charcoal">Nutrition Continuity</h4>
          <p className="text-xs text-charcoal/40 font-medium">Daily Logging Streak</p>
        </div>
        <div className="ml-auto">
          <Award className={`w-6 h-6 ${days > 0 ? 'text-gold' : 'text-charcoal/10'}`} />
        </div>
      </div>
    </div>
  );
}
