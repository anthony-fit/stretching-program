import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Droplets, 
  Zap, 
  Activity, 
  Calendar, 
  Sparkles,
  Target,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { nutritionPersistenceService } from '../../nutrition/services/nutritionPersistenceService';
import { recoveryInsightService } from '../../recovery/services/recoveryInsightService';
import { streakEngine } from '../services/streakEngine';
import { buildDailyAthleteFlow } from '../services/buildDailyAthleteFlow';
import { DailyAthleteFlow, AthleteRecommendation } from '../types';

import { AthleteReadinessHero } from '../components/AthleteReadinessHero';
import { HabitStreakCard } from '../components/HabitStreakCard';
import { DailyPriorityCard } from '../components/DailyPriorityCard';
import { NutritionHeader } from '../../nutrition/components/NutritionHeader';

import { RecoveryTrendStrip } from '../components/RecoveryTrendStrip';
import { AthleteProgressTimeline } from '../components/AthleteProgressTimeline';
import { WorkoutReport } from '../../../lib/reports';

import { snapshotManager } from '../../athlete-memory/services/snapshotManager';
import { generateAdaptiveDNA } from '../../athlete-memory/services/adaptiveProfileEngine';
import { analyzeWeeklyEvolution } from '../../athlete-memory/analytics/weeklyEvolutionAnalyzer';
import { AdaptiveAthleteDNA, WeeklyEvolutionMetrics } from '../../athlete-memory/types';
import { AdaptiveAthleteDNACard } from '../../athlete-memory/components/AdaptiveAthleteDNACard';
import { WeeklyEvolutionSummary } from '../../athlete-memory/components/WeeklyEvolutionSummary';

export default function AthleteDashboardPage() {
  const [data, setData] = useState<DailyAthleteFlow | null>(null);
  const [reports, setReports] = useState<WorkoutReport[]>([]);
  const [dna, setDna] = useState<AdaptiveAthleteDNA | null>(null);
  const [evolution, setEvolution] = useState<WeeklyEvolutionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const recovery = await recoveryInsightService.getReadinessState();
      const streaks = streakEngine.getStreaks();
      const profileData = await nutritionPersistenceService.getProfileState();
      
      const hydrationProgress = (recovery?.hydrationScore || 0) / 100;

      // Take a daily snapshot for memory tracking
      await snapshotManager.takeDailySnapshot({
        recoveryScore: recovery?.recoveryScore || 0,
        hydrationProgress,
        calorieAdherence: 0,
        fatigueLevel: (100 - (recovery?.recoveryScore || 100))
      });

      // Fetch longitudinal memory
      const history = await snapshotManager.getAthleteHistory();
      const athleteDna = generateAdaptiveDNA(history);
      const weeklyEvolution = analyzeWeeklyEvolution(history);
      
      setDna(athleteDna);
      setEvolution(weeklyEvolution);

      const mapApiActivityLevel = (level?: string): 'Low' | 'Medium' | 'High' => {
        if (!level) return 'Medium';
        if (level === 'sedentary' || level === 'lightly_active') return 'Low';
        if (level === 'moderately_active') return 'Medium';
        return 'High';
      };

      const recommendation = buildDailyAthleteFlow(recovery, streaks, {
        hydrationProgress,
        calorieBalance: 0, // Simplified for now
        activityLevel: mapApiActivityLevel(profileData.profile?.activityLevel)
      }, athleteDna);
      
      // Get reports from localStorage
      const savedReports = localStorage.getItem('workout_reports_v1');
      const reportsList: WorkoutReport[] = savedReports ? JSON.parse(savedReports) : [];
      setReports(reportsList);

      setData({
        date: new Date().toISOString(),
        readiness: recovery,
        recommendation,
        streaks
      });
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLaunchStudio = () => {
    if (!data) return;
    navigate('/studio', { 
      state: { 
        athleteRecommendation: data.recommendation 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-gold animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.2)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/60">Bio-Syncing</span>
        </div>
      </div>
    );
  }

  if (!data || !data.readiness) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck className="w-16 h-16 text-white/10 mb-6" />
        <h2 className="text-3xl font-serif italic mb-4">Athlete ID Required</h2>
        <p className="text-cream/60 max-w-sm mb-10 leading-relaxed">
          Initialize your performance profile to access elite readiness dashboards and daily flows.
        </p>
        <button 
          onClick={() => navigate('/nutrition')}
          className="bg-gold text-charcoal px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          Initialize Profile
        </button>
      </div>
    );
  }

  const { recommendation, streaks, readiness } = data;

  return (
    <div className="min-h-screen bg-charcoal text-cream pb-32">
      <NutritionHeader title="Athlete Command" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <AthleteReadinessHero 
          score={readiness.recoveryScore} 
          status={readiness.readiness} 
          recommendation={recommendation.mobilityRecommendation}
          handleLaunchStudio={handleLaunchStudio}
        />

        {evolution && <WeeklyEvolutionSummary metrics={evolution} />}

        {/* Priority Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              <DailyPriorityCard 
                label="Mobility Focus"
                value={recommendation.mobilityRecommendation}
                icon={<Activity className="w-5 h-5" />}
                color="text-gold"
              />
              <DailyPriorityCard 
                label="Nutrition Signal"
                value={recommendation.nutritionPriority}
                icon={<Target className="w-5 h-5" />}
                color="text-emerald-400"
              />
              <DailyPriorityCard 
                label="Recovery Objective"
                value={recommendation.recoveryPriority}
                icon={<Zap className="w-5 h-5" />}
                color="text-gold"
              />
              <DailyPriorityCard 
                label="Daily Duration"
                value={`${recommendation.suggestedDuration} Minute Flow`}
                icon={<Calendar className="w-5 h-5" />}
                color="text-cream"
              />
           </div>

           {dna ? (
             <AdaptiveAthleteDNACard dna={dna} />
           ) : (
             <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-3xl p-8 border border-gold/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 text-gold">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Intelligence</span>
                  </div>
                  <p className="text-lg font-serif italic text-white/90 leading-relaxed mb-8">
                    Your system has maintained a {streaks.mobilityCount}-day mobility streak. Consistency is compounding into structural elastic resilience.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/nutrition')}
                  className="group flex items-center justify-between text-xs font-black uppercase tracking-widest text-gold hover:text-white transition-colors"
                >
                  Log Bio-Data
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           )}
        </div>

        {/* Consistency Engine */}
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <HabitStreakCard streaks={streaks} />
           </div>
           <div>
              <AthleteProgressTimeline reports={reports} />
           </div>
        </div>

        {/* Quick Launch / Module Sync Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <QuickLaunchCard 
              title="Nutritional Integrity"
              desc="View macros, hydration, and adherence logs."
              route="/nutrition"
              icon={<Droplets className="w-6 h-6" />}
              color="border-blue-400/20 text-blue-400"
           />
           <QuickLaunchCard 
              title="Recovery Diagnostic"
              desc="Deep dive into system readiness markers."
              route="/recovery"
              icon={<ShieldCheck className="w-6 h-6" />}
              color="border-gold/20 text-gold"
           />
        </section>
      </main>
    </div>
  );
}

interface QuickLaunchCardProps {
  title: string;
  desc: string;
  route: string;
  icon: React.ReactNode;
  color: string;
}

function QuickLaunchCard({ title, desc, route, icon, color }: QuickLaunchCardProps) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(route)}
      className={`bg-white/5 border ${color} rounded-3xl p-8 text-left hover:bg-white/10 transition-all group`}
    >
      <div className={`p-4 rounded-2xl bg-white/5 inline-flex mb-6 ${color.split(' ')[1]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-serif italic text-white mb-2">{title}</h3>
      <p className="text-cream/50 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Navigate to module <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
