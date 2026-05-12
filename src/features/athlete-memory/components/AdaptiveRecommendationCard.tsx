import React from 'react';
import { Sparkles, Activity, Timer } from 'lucide-react';
import { StudioBootstrapPresets } from '../services/buildAdaptiveStudioBootstrap';

interface AdaptiveRecommendationCardProps {
  presets: StudioBootstrapPresets;
}

export function AdaptiveRecommendationCard({ presets }: AdaptiveRecommendationCardProps) {
  return (
    <div className="bg-white/5 border border-gold/20 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-16 -mt-16" />
      
      <div className="flex items-center gap-2 mb-4 text-gold shrink-0">
        <Sparkles className="w-4 h-4" />
        <h4 className="text-[10px] font-black uppercase tracking-widest">Adaptive Studio Preset</h4>
      </div>

      <p className="text-sm font-medium text-cream/90 leading-relaxed mb-6 font-serif italic relative z-10">
        "{presets.adaptiveReasoning}"
      </p>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-charcoal/40 border border-white/5 rounded-xl p-3">
           <div className="text-[8px] font-black uppercase tracking-widest text-cream/40 mb-1 flex items-center gap-1">
             <Timer className="w-3 h-3" /> Focus
           </div>
           <div className="text-xs font-bold text-white">{presets.recommendedFocus}</div>
        </div>
        <div className="bg-charcoal/40 border border-white/5 rounded-xl p-3">
           <div className="text-[8px] font-black uppercase tracking-widest text-cream/40 mb-1 flex items-center gap-1">
             <Activity className="w-3 h-3" /> Duration
           </div>
           <div className="text-xs font-bold text-white">{presets.recommendedDuration} Min</div>
        </div>
      </div>
    </div>
  );
}
