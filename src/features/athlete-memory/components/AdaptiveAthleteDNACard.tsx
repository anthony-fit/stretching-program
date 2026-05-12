import React from 'react';
import { Fingerprint, Target, Zap, Activity } from 'lucide-react';
import { AdaptiveAthleteDNA } from '../types';

interface AdaptiveAthleteDNACardProps {
  dna: AdaptiveAthleteDNA;
}

export function AdaptiveAthleteDNACard({ dna }: AdaptiveAthleteDNACardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-gold" />
          <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-cream/40">Adaptive Athlete DNA</h3>
        </div>
        <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-gold/20">
          Level {Math.ceil(dna.consistencyScore / 10)}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-serif italic text-white">{dna.athleteType}</h2>
        <p className="text-sm text-cream/60 leading-relaxed font-medium">Class boundaries dynamically generated from longitudinal adherence matrices.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DNAProp label="Recovery Modulus" value={dna.recoveryBias} icon={<Zap className="w-4 h-4" />} />
        <DNAProp label="Optimal Engine" value={`${dna.optimalSessionWindow}m`} icon={<Activity className="w-4 h-4" />} />
        <DNAProp label="Fatigue Pattern" value={dna.fatiguePattern} icon={<Target className="w-4 h-4" />} />
        <DNAProp label="Progression" value={dna.progressionTrend} icon={<Fingerprint className="w-4 h-4" />} />
      </div>
    </div>
  );
}

function DNAProp({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-gold/30 transition-all flex flex-col gap-2">
      <div className="flex items-center gap-2 text-cream/30">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-medium text-cream">{value}</span>
    </div>
  );
}
