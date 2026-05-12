import React from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { CoachingInsight } from '../services/nutritionCoachingService';
import { motion } from 'motion/react';

interface NutritionCoachCardProps {
  insight: CoachingInsight | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function NutritionCoachCard({ insight, isLoading, onRefresh }: NutritionCoachCardProps) {
  return (
    <div className="bg-gradient-to-br from-charcoal to-charcoal/90 text-cream rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium">Elite Coach</h3>
              <p className="text-[10px] font-bold text-gold/60 uppercase tracking-widest">AI Performance Insights</p>
            </div>
          </div>
          
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-cream/40 hover:text-cream"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="min-h-[80px]">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
              <div className="h-4 bg-white/5 rounded-full w-4/5 animate-pulse" />
              <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
            </div>
          ) : insight ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm leading-relaxed text-cream/80 italic font-serif"
            >
              "{insight.message}"
            </motion.p>
          ) : (
            <p className="text-sm text-cream/40 italic">Log more data for coaching insights.</p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
           {insight && (
             <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
               insight.type === 'warning' ? 'border-orange-500/40 text-orange-400' : 
               insight.type === 'tip' ? 'border-blue-500/40 text-blue-400' : 
               'border-gold/40 text-gold'
             }`}>
               {insight.type}
             </div>
           )}
           <span className="text-[10px] font-medium text-cream/20 uppercase tracking-widest">Powered by Groq Edge</span>
        </div>
      </div>
    </div>
  );
}
