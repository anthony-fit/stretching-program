import React from 'react';

interface RecoveryTrendStripProps {
  history: number[]; // Scores from last X days
}

export function RecoveryTrendStrip({ history }: RecoveryTrendStripProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40">Recovery Trend</h3>
        <span className="text-[10px] font-medium text-gold/60 italic">Last 7 Sessions</span>
      </div>
      
      <div className="flex items-end justify-between h-12 gap-2">
        {history.map((score, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
            <div 
              className="w-full bg-gold/20 rounded-full relative overflow-hidden"
              style={{ height: '100%' }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gold rounded-full transition-all duration-1000"
                style={{ height: `${score}%` }}
              />
            </div>
            <span className="text-[8px] font-black text-cream/20 group-hover:text-gold transition-colors">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
