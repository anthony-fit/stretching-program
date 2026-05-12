import React from 'react';
import { Waves, Zap, BatteryLow } from 'lucide-react';

interface RecoveryInsightCardProps {
  hydrationPercent: number;
  proteinPercent: number;
}

export function RecoveryInsightCard({ hydrationPercent, proteinPercent }: RecoveryInsightCardProps) {
  const recoveryScore = Math.round((hydrationPercent + proteinPercent) / 2);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg font-medium text-charcoal">Recovery Status</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          recoveryScore > 80 ? 'bg-green-50 text-green-600' :
          recoveryScore > 50 ? 'bg-orange-50 text-orange-600' :
          'bg-red-50 text-red-600'
        }`}>
          {recoveryScore}% Optimized
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal/40 uppercase tracking-widest">
            <Waves className="w-3 h-3 text-blue-500" />
            <span>Hydration</span>
          </div>
          <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${hydrationPercent}%` }} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal/40 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-orange-500" />
            <span>Muscle Fuel</span>
          </div>
          <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-1000" 
              style={{ width: `${proteinPercent}%` }} 
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-charcoal/40 leading-relaxed italic">
        {recoveryScore > 80 
          ? "Body is primed for deep mobility work tonight." 
          : "Focus on rehydration before attempting advanced stretching blocks."}
      </p>
    </div>
  );
}
