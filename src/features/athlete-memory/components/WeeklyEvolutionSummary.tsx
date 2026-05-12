import React from 'react';
import { TrendingUp, ShieldCheck, Dumbbell, Droplets } from 'lucide-react';
import { WeeklyEvolutionMetrics } from '../types';

interface WeeklyEvolutionSummaryProps {
  metrics: WeeklyEvolutionMetrics;
}

export function WeeklyEvolutionSummary({ metrics }: WeeklyEvolutionSummaryProps) {
  const isOptimalDelta = metrics.recoveryDelta > 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40">Weekly Evolution Analytics</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-cream/30 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Recovery Delta
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-serif italic text-white">{isOptimalDelta ? '+' : ''}{metrics.recoveryDelta}%</span>
          </div>
          <p className={`text-xs font-medium ${isOptimalDelta ? 'text-emerald-400' : 'text-cream/50'}`}>7-Day Rolling Average</p>
        </div>

        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-cream/30 flex items-center gap-2">
            <Droplets className="w-3 h-3" />
            Hydration
          </div>
          <div className="text-xl font-medium text-white">{metrics.hydrationTrend}</div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
            <div className={`h-full bg-blue-400 w-3/4`} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-cream/30 flex items-center gap-2">
            <Dumbbell className="w-3 h-3" />
            Consistency
          </div>
          <div className="text-xl font-medium text-white">{metrics.consistencyTrend}</div>
          <p className="text-xs font-medium text-cream/50">vs Previous Week</p>
        </div>

        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-cream/30">
            Resilience Score
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-serif italic text-gold">{metrics.recoveryResilienceScore}</span>
            <span className="text-sm text-cream/40 pb-1">/100</span>
          </div>
          <p className="text-xs font-medium text-cream/50">Burnout Risk: <span className={metrics.burnoutRisk === 'High' ? 'text-red-400' : 'text-emerald-400'}>{metrics.burnoutRisk}</span></p>
        </div>
      </div>
    </div>
  );
}
