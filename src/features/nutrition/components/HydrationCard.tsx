import React from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';

interface HydrationCardProps {
  target: number;
  current: number;
  onUpdate: (amount: number) => void;
}

export function HydrationCard({ target, current, onUpdate }: HydrationCardProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <Droplets className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-serif font-medium text-charcoal">Hydration</h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-cream stroke-current"
              strokeWidth="8"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-blue-500 stroke-current transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-charcoal">{current.toFixed(1)}L</span>
            <span className="text-[10px] font-medium text-charcoal/40 uppercase tracking-widest">Goal {target}L</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={() => onUpdate(-0.25)}
            className="flex-1 bg-cream hover:bg-cream/80 text-charcoal p-3 rounded-xl transition-colors flex items-center justify-center"
            disabled={current <= 0}
          >
            <Minus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onUpdate(0.25)}
            className="flex-1 bg-charcoal text-cream p-3 rounded-xl hover:bg-charcoal/90 transition-colors flex items-center justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-charcoal/40 mt-4 text-center">Add 250ml per tap</p>
      </div>
    </div>
  );
}
