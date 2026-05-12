import React from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Goal } from '../types';

interface DailyOverviewCardProps {
  goal: Goal;
  netCalories: number;
  maintenanceCalories: number;
}

export function DailyOverviewCard({ goal, netCalories, maintenanceCalories }: DailyOverviewCardProps) {
  const surplus = netCalories - maintenanceCalories;
  
  const getGoalStatus = () => {
    switch (goal) {
      case 'fat_loss':
        return surplus < 0 ? 'Optimal Deficit' : 'Surplus Detected';
      case 'muscle_gain':
        return surplus > 0 ? 'Building Phase' : 'Below Surplus';
      case 'maintenance':
      default:
        return Math.abs(surplus) < 200 ? 'On Track' : 'Deviation Detected';
    }
  };

  const statusColor = () => {
    switch (getGoalStatus()) {
      case 'Optimal Deficit':
      case 'Building Phase':
      case 'On Track':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  return (
    <div className="bg-charcoal text-cream rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-serif font-medium mb-1">Elite Overview</h2>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor()}`}>
              <Target className="w-3 h-3" />
              {getGoalStatus()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-gold uppercase tracking-widest block mb-1">Goal</span>
            <span className="text-sm font-bold uppercase tracking-wider">{goal.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] font-bold text-cream/40 uppercase tracking-widest block mb-2">Net Calories</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter">{netCalories}</span>
              <span className="text-xs text-cream/40">kcal</span>
            </div>
          </div>
          
          <div>
            <span className="text-[10px] font-bold text-cream/40 uppercase tracking-widest block mb-2">Daily Delta</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold tracking-tighter ${surplus > 0 ? 'text-orange-400' : 'text-gold'}`}>
                {surplus > 0 ? `+${surplus}` : surplus}
              </span>
              <span className="text-xs text-cream/40">kcal</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cream/10">
          <div className="flex items-center gap-4 text-xs font-medium text-cream/60">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span>Maintenance level is approximately {maintenanceCalories} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
