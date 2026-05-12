import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, Droplets, Zap, ShieldCheck, ArrowLeft, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoveryInsightService } from '../services/recoveryInsightService';
import { RecoveryScoreResult } from '../types';
import { ReadinessRing } from '../components/ReadinessRing';
import { NutritionHeader } from '../../nutrition/components/NutritionHeader';
import { nutritionCoachingService, CoachingInsight } from '../../nutrition/services/nutritionCoachingService';
import { streakEngine } from '../../athlete/services/streakEngine';

export default function RecoveryDashboardPage() {
  const [data, setData] = useState<RecoveryScoreResult | null>(null);
  const [insight, setInsight] = useState<CoachingInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const result = await recoveryInsightService.getReadinessState();
      setData(result);
      
      if (result) {
        streakEngine.incrementRecoveryStreak();
        const aiInsight = await nutritionCoachingService.getRecoveryInsight(result);
        setInsight(aiInsight);
      }
      
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Activity className="w-12 h-12 text-gold animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-charcoal text-cream p-8 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-cream/20 mb-6" />
        <h2 className="text-2xl font-serif italic mb-4">Profile Required</h2>
        <p className="text-cream/60 max-w-md mb-8">
          We need your nutrition profile and some logs to calculate your recovery intelligence.
        </p>
        <button 
          onClick={() => navigate('/nutrition')}
          className="bg-gold text-charcoal px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream pb-20">
      <NutritionHeader title="Recovery Intelligence" showBack />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Main Readiness Score */}
        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="w-64 h-64 -mr-20 -mt-20" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="flex justify-center md:justify-start">
              <ReadinessRing score={data.recoveryScore} />
            </div>
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
                  <Zap className="w-4 h-4 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold">System State: {data.readiness}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight">
                  {data.readiness === 'High' ? 'Peak Performance Ready' : 
                   data.readiness === 'Moderate' ? 'Balanced Resilience' : 'Restoration Required'}
                </h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-cream/80">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <DiagnosticCard 
            title="Hydration Readiness" 
            value={data.hydrationScore} 
            icon={<Droplets className="w-5 h-5" />}
            color="text-blue-400"
          />
          <DiagnosticCard 
            title="Protein Synthesis" 
            value={data.nutritionScore} 
            icon={<Zap className="w-5 h-5" />}
            color="text-gold"
          />
          <DiagnosticCard 
            title="Mobility Consistency" 
            value={data.mobilityScore} 
            icon={<Activity className="w-5 h-5" />}
            color="text-emerald-400"
          />
        </div>

        {/* Warnings & Insights */}
        {data.warnings.length > 0 && (
          <section className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-500">Recovery Warnings</h3>
            </div>
            <ul className="space-y-3">
              {data.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-red-200/80 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* AI Recovery Coach Insight */}
        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">AI Recovery Intelligence</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <p className="text-xl md:text-2xl font-serif italic text-white leading-relaxed">
                  {insight?.message || "Synthesizing bio-data for your next breakthrough..."}
                </p>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 italic">
                  <Activity className="w-3 h-3" />
                  Deterministic context calibrated with Groq Llama-3
                </div>
              </div>
              
              <div className="shrink-0 w-full md:w-64 space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Primary Directive</p>
                  <p className="text-xs font-medium text-cream/80">
                    {data.recoveryScore < 50 ? "Prioritize nervous system down-regulation and high-quality protein." : 
                     data.recoveryScore < 80 ? "Maintain current volume but optimize hydration sync." : 
                     "Full spectrum output authorized. Protocol baseline stable."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Interpretation Section */}
        <section className="bg-white/5 rounded-2xl p-8 border border-white/5 opacity-50">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-cream/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40">Technical Interpretation</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-serif italic">Physiological Load</h4>
              <p className="text-sm text-cream/60 leading-relaxed">
                Your recovery score is a multi-variant analysis of fluid-to-tissue ratio and protein availability. 
                Current markers suggest your connective tissue is {data.hydrationScore > 70 ? 'highly elastic' : 'experiencing minor stiffness'}.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-serif italic">Active Restoration</h4>
              <p className="text-sm text-cream/60 leading-relaxed">
                Consistency in mobility patterns is the primary driver of joint health. 
                Your {data.mobilityScore}% consistency indicates a {data.mobilityScore > 80 ? 'mastered' : 'developing'} habit ritual.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface DiagnosticCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function DiagnosticCard({ title, value, icon, color }: DiagnosticCardProps) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          {icon}
        </div>
        <span className={`text-xl font-mono font-bold ${color}`}>{value}%</span>
      </div>
      <h3 className="text-sm font-medium text-cream/80">{title}</h3>
      <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${color.replace('text', 'bg')}`}
        />
      </div>
    </div>
  );
}
