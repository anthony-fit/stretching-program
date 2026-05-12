import React from 'react';
import { Target } from 'lucide-react';

interface SessionConfidenceCardProps {
  confidence: number;
}

export function SessionConfidenceCard({ confidence }: SessionConfidenceCardProps) {
  let colorClass = 'text-emerald-400';
  let message = 'High Probability of Completion';
  
  if (confidence < 50) {
    colorClass = 'text-red-400';
    message = 'High Friction. Consider reducing duration.';
  } else if (confidence < 75) {
    colorClass = 'text-gold';
    message = 'Moderate Adherence Expected';
  }

  return (
    <div className="bg-charcoal/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-white/5 ${colorClass}`}>
          <Target className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-cream/40 mb-1">
             Completion Confidence
          </div>
          <div className="text-xs font-medium text-cream">{message}</div>
        </div>
      </div>
      <div className={`text-2xl font-serif italic font-bold ${colorClass}`}>
        {confidence}%
      </div>
    </div>
  );
}
