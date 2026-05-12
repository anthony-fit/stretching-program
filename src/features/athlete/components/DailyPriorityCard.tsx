import React from 'react';
import { Target, Zap, Waves, Activity } from 'lucide-react';

interface DailyPriorityCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function DailyPriorityCard({ label, value, icon, color }: DailyPriorityCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:border-white/20 transition-all">
      <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-cream/40 mb-1">{label}</h4>
        <p className="text-sm font-medium text-cream/80 leading-snug">{value}</p>
      </div>
    </div>
  );
}
