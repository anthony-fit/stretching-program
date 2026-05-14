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
  ArrowRight,
  Gauge,
  Brain
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

import { buildHabitMomentum, HabitMomentumMetrics } from '../utils/buildHabitMomentum';
import { behavioralContinuityEngine, BehavioralState } from '../services/behavioralContinuityEngine';
import { weeklyRecoveryRhythmEngine, WeeklyRhythmState } from '../services/weeklyRecoveryRhythmEngine';
import { buildWeeklyAthleteInsights } from '../utils/buildWeeklyAthleteInsights';
import { predictiveRecoveryEngine, PredictiveRecoveryState, PredictiveStatus } from '../services/predictiveRecoveryEngine';
import { buildPredictiveInsights } from '../utils/buildPredictiveInsights';
import { autonomousRecoveryEngine, AutonomousStatus } from '../services/autonomousRecoveryEngine';
import { recoveryPressureArbitrator, ArbitrationDecision } from '../services/recoveryPressureArbitrator';
import { buildAutonomousInsights } from '../utils/buildAutonomousInsights';

export default function AthleteDashboardPage() {
  const [data, setData] = useState<DailyAthleteFlow | null>(null);
  const [reports, setReports] = useState<WorkoutReport[]>([]);
  const [dna, setDna] = useState<AdaptiveAthleteDNA | null>(null);
  const [evolution, setEvolution] = useState<WeeklyEvolutionMetrics | null>(null);
  const [momentum, setMomentum] = useState<HabitMomentumMetrics | null>(null);
  const [behavioralState, setBehavioralState] = useState<BehavioralState | null>(null);
  const [weeklyRhythm, setWeeklyRhythm] = useState<WeeklyRhythmState | null>(null);
  const [predictiveStatus, setPredictiveStatus] = useState<PredictiveStatus | null>(null);
  const [autonomousStatus, setAutonomousStatus] = useState<AutonomousStatus | null>(null);
  const [arbitration, setArbitration] = useState<ArbitrationDecision | null>(null);
  const [weeklyInsights, setWeeklyInsights] = useState<string[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<string[]>([]);
  const [autonomousInsights, setAutonomousInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const recovery = await recoveryInsightService.getReadinessState();
      const streaks = streakEngine.getStreaks();
      const profileData = await nutritionPersistenceService.getProfileState();
      const timelines = await nutritionPersistenceService.getAllTimelines();
      
      const hydrationProgress = (recovery?.hydrationScore || 0) / 100;

      // Extract stats from timelines
      let recentSkippedMeals = 0;
      let recentCompletedMeals = 0;
      let recentRegenerations = 0;
      
      timelines.slice(-3).forEach(t => {
        t.slots.forEach(s => {
           if (s.status === 'skipped') recentSkippedMeals++;
           if (s.status === 'completed' || s.status === 'ate_half') recentCompletedMeals++;
           if (s.regenerationCount) recentRegenerations += s.regenerationCount;
        });
      });

      const history = await snapshotManager.getAthleteHistory();
      
      let recoveryTrend = recovery?.recoveryScore || 0;
      if (history.length > 0) {
        recoveryTrend = history.slice(-7).reduce((acc, h) => acc + h.recoveryScore, 0) / Math.min(history.length, 7);
      }

      let hydrationConsistency = hydrationProgress * 100;
      if (history.length > 0) {
         hydrationConsistency = (history.slice(-7).reduce((acc, h) => acc + h.hydrationProgress, 0) / Math.min(history.length, 7)) * 100;
      }
      
      const momentumMetrics = buildHabitMomentum({
        streakNutrition: streaks.nutritionLogCount,
        streakMobility: streaks.mobilityCount,
        recentSkippedMeals,
        recentCompletedMeals,
        hydrationConsistency,
        recoveryTrend
      });

      const bState = behavioralContinuityEngine.detectState({
        momentum: momentumMetrics,
        recentRegenerations,
        recentSkippedMeals,
        recentLowRecoveryDays: history.slice(-3).filter(h => h.recoveryScore < 50).length
      });

      const avgMealCompletion = timelines.length ? timelines.reduce((acc, t) => {
         let completed = 0;
         t.slots.forEach(s => { if(s.status === 'completed' || s.status === 'ate_half') completed++; });
         return acc + (t.slots.length > 0 ? (completed / t.slots.length) * 100 : 0);
      }, 0) / timelines.length : 0;

      const rhythmInput = {
        historyDays: history.length,
        avgMobilityAdherence: (streaks.mobilityCount / 7) * 100,
        avgHydrationConsistency: hydrationConsistency,
        avgMealCompletion,
        avgRecoveryScore: recoveryTrend,
        burnoutIndicators: (recentSkippedMeals > 2 ? 1 : 0) + (bState === 'overwhelmed' || bState === 'fatigued' ? 1 : 0),
        regenerationFrequency: recentRegenerations
      };

      const wRhythm = weeklyRecoveryRhythmEngine.detectRhythm(rhythmInput);
      const wInsights = buildWeeklyAthleteInsights(rhythmInput);

      const pInput = {
        historyDays: history.length,
        recentSkippedMeals,
        hydrationInconsistency: 14 - (hydrationConsistency / 100 * 14),
        lowRecoveryStreaks: history.slice(-5).filter(h => h.recoveryScore < 50).length,
        excessiveRegenerations: recentRegenerations,
        mobilityDropoff: history.length > 7 ? (history.slice(-7).reduce((acc, h) => acc + h.mobilityAdherence, 0) < history.slice(-14, -7).reduce((acc, h) => acc + h.mobilityAdherence, 0)) : false,
        decliningCompletion: false
      };

      const pStatus = predictiveRecoveryEngine.analyze(pInput);
      const pInsights = buildPredictiveInsights(pInput);

      const aStatus = autonomousRecoveryEngine.detectState({
        predictiveStatus: pStatus,
        behavioralState: bState,
        weeklyRhythm: wRhythm,
        momentum: momentumMetrics,
        regenerationPressure: (recentRegenerations / 15) * 100 // Normalized to daily budget
      });
      const aDecision = recoveryPressureArbitrator.arbitrate(aStatus);
      const aInsights = buildAutonomousInsights(aStatus, aDecision);

      setMomentum(momentumMetrics);
      setBehavioralState(bState);
      setWeeklyRhythm(wRhythm);
      setWeeklyInsights(wInsights);
      setPredictiveStatus(pStatus);
      setPredictiveInsights(pInsights);
      setAutonomousStatus(aStatus);
      setArbitration(aDecision);
      setAutonomousInsights(aInsights);

      // Take a daily snapshot for memory tracking
      await snapshotManager.takeDailySnapshot({
        date: new Date().toISOString().split('T')[0],
        recoveryScore: recovery?.recoveryScore || 0,
        hydrationProgress,
        calorieAdherence: 1, // Using latest local context
        mobilityAdherence: streaks.mobilityCount > 0 ? 1 : 0,
        fatigueLevel: (100 - (recovery?.recoveryScore || 100))
      });

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

      const recommendation = buildDailyAthleteFlow(
        recovery, 
        streaks, 
        {
          hydrationProgress,
          calorieBalance: 0, // Simplified for now
          activityLevel: mapApiActivityLevel(profileData.profile?.activityLevel)
        }, 
        athleteDna,
        aStatus,
        aDecision
      );
      
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
           <div className="lg:col-span-2 space-y-8">
              <HabitStreakCard streaks={streaks} />
              
              {weeklyInsights.length > 0 && (
                <div className="bg-gradient-to-r from-blue-900/40 to-charcoal border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-blue-400">
                    <Brain className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Adaptive Rhythm Insights</span>
                  </div>
                  <div className="space-y-3">
                    {[...weeklyInsights, ...predictiveInsights, ...autonomousInsights].map((insight, idx) => (
                      <p key={idx} className="text-sm text-cream/80 flex items-start gap-2">
                        <span className="text-gold mt-1">✨</span>
                        {insight}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {momentum && behavioralState && weeklyRhythm && predictiveStatus && autonomousStatus && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-gold mb-4">
                       <Zap className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Recovery OS</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Operating State</div>
                        <div className="text-xl font-serif text-white capitalize">{autonomousStatus.state}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">System Load</div>
                          <div className={`text-sm font-bold ${autonomousStatus.systemLoad > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {autonomousStatus.systemLoad}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Bias</div>
                          <div className="text-sm text-gold font-bold uppercase">
                            {autonomousStatus.optimizationPressure > 50 ? 'Optimize' : 'Stabilize'}
                          </div>
                        </div>
                      </div>
                      <div>
                         <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Routing Strategy</div>
                         <div className="text-[11px] text-cream/80 font-medium italic">"{autonomousStatus.routingBias}"</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <Gauge className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-gold mb-4">
                       <Zap className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Predictive Stability</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">State Window</div>
                        <div className="text-xl font-serif text-white capitalize">{predictiveStatus.state.replace('_', ' ')}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Drift</div>
                          <div className={`text-sm font-bold ${predictiveStatus.state === 'stable_growth' ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {predictiveStatus.state === 'stable_growth' ? '↑ Positive' : '↓ Negative'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Pressure</div>
                          <div className={`text-sm font-bold uppercase ${
                            predictiveStatus.burnoutPressure === 'high' ? 'text-red-400' : 
                            predictiveStatus.burnoutPressure === 'moderate' ? 'text-orange-400' : 
                            'text-emerald-400'
                          }`}>
                            {predictiveStatus.burnoutPressure}
                          </div>
                        </div>
                      </div>
                      <div>
                         <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Stability Analysis</div>
                         <div className="text-[11px] text-cream/80 font-medium italic">"{predictiveStatus.stabilityWindow}"</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                       <Activity className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                       <Activity className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Weekly Rhythm</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Rhythm State</div>
                        <div className="text-xl font-serif text-white capitalize">
                          {weeklyRhythm.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-cream/50 uppercase tracking-widest font-bold mb-1">Adaptive Pressure</div>
                        <div className="text-sm text-cream font-medium capitalize">
                          {behavioralState.replace('_', ' ')} / {momentum.recoveryDiscipline < 50 ? 'High' : 'Optimal'} Recovery Drift
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
