import React from 'react';
import { ShieldCheck, Zap, Droplets, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { RecoveryTrendStrip } from './RecoveryTrendStrip';

interface AthleteReadinessHeroProps {
  score: number;
  status: string;
  recommendation: string;
  handleLaunchStudio: () => void;
}

export function AthleteReadinessHero({ score, status, recommendation, handleLaunchStudio }: AthleteReadinessHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-charcoal to-charcoal/90 text-cream rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gold selection:bg-gold selection:text-charcoal">System Readiness</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif italic text-white leading-[1.1] mb-6">
               Your system is <span className="text-gold capitalize">{status.toLowerCase()}</span>
            </h1>
            <p className="text-lg text-cream/60 font-serif italic max-w-sm mb-8">
              "{recommendation}"
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
             <button 
               onClick={handleLaunchStudio}
               className="bg-gold text-charcoal px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/10"
             >
               Launch Recommended Session
               <ArrowRight className="w-5 h-5" />
             </button>
             <button 
               onClick={() => navigate('/recovery')}
               className="bg-white/5 border border-white/10 text-cream px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all"
             >
               View Recovery
             </button>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-end gap-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="110"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-white/5"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="110"
                fill="none"
                stroke="#EAB308"
                strokeWidth="12"
                strokeDasharray="691"
                initial={{ strokeDashoffset: 691 }}
                animate={{ strokeDashoffset: 691 - (691 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
               <span className="text-6xl font-serif italic font-bold text-white selection:bg-gold selection:text-charcoal">{score}%</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40 mt-2">Elite Score</span>
            </div>
          </div>
          
          <div className="w-64">
            <RecoveryTrendStrip history={[72, 75, 68, 82, 85, 79, score]} />
          </div>
        </div>
      </div>
    </div>
  );
}
