import React from 'react';
import { Flame, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CaloriesBurnedCardProps {
  totalBurned: number;
  recentActivity: {
    name: string;
    calories: number;
    timestamp: number;
  } | null;
}

export function CaloriesBurnedCard({ totalBurned, recentActivity }: CaloriesBurnedCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/10 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
          <Flame className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-serif font-medium text-charcoal">Activity</h2>
      </div>

      <div className="flex-1">
        <div className="mb-6">
          <div className="text-3xl font-bold text-charcoal">{totalBurned}</div>
          <div className="text-xs font-medium text-charcoal/40 uppercase tracking-widest">Total Kcal Burned Today</div>
        </div>

        {recentActivity ? (
          <div className="bg-cream/30 rounded-xl p-4 mb-6">
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest mb-1">Recent Activity</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-charcoal">{recentActivity.name}</span>
              <span className="text-sm font-bold text-orange-500">+{recentActivity.calories} kcal</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-charcoal/40 italic mb-6">No activity logged yet today.</div>
        )}
      </div>

      <Link 
        to="/calories-burned-calculator"
        className="w-full inline-flex items-center justify-center gap-2 bg-cream hover:bg-gold/10 text-charcoal font-medium py-3 rounded-xl transition-all group"
      >
        <span>Record Activity</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}
