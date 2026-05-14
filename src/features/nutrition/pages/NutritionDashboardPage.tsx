import React, { useState, useEffect, Suspense } from 'react';
import { NutritionHeader } from '../components/NutritionHeader';
import { MetricsCard } from '../components/MetricsCard';
import { MacroSummaryCard } from '../components/MacroSummaryCard';
import { HydrationCard } from '../components/HydrationCard';
import { CaloriesBurnedCard } from '../components/CaloriesBurnedCard';
import { DailyOverviewCard } from '../components/DailyOverviewCard';
import { FoodSearchBar } from '../components/FoodSearchBar';
import { FoodSearchResults } from '../components/FoodSearchResults';
import { FoodDetailSheet } from '../components/FoodDetailSheet';
import { NutritionJournal } from '../components/NutritionJournal';
import { NutritionCoachCard } from '../components/NutritionCoachCard';
import { RecoveryInsightCard } from '../components/RecoveryInsightCard';
import { HabitStreakCard } from '../components/HabitStreakCard';
import { GenerateMealCard } from '../components/GenerateMealCard';
import { nutritionPersistenceService } from '../services/nutritionPersistenceService';
import { nutritionCoachingService, CoachingInsight } from '../services/nutritionCoachingService';
import { nutritionApiService } from '../adapters';
import { buildNutritionInsightContext } from '../services/buildNutritionInsightContext';
import { buildMealGenerationContext } from '../services/buildMealGenerationContext';
import { timelineGenerationEngine } from '../calculators/timelineGenerationEngine';
import { adaptiveMealTimelineEngine } from '../services/adaptiveMealTimelineEngine';
import { buildMealTimelineInsights } from '../utils/buildMealTimelineInsights';
import { mealGenerationService } from '../services/mealGenerationService';
import { calculateTDEE } from '../calculators/calculateTDEE';
import { calculateMacroTargets } from '../calculators/calculateMacroTargets';
import { calculateHydration } from '../calculators/calculateHydration';
import { safeFetch } from '../../../lib/network/safeFetch';
import { 
  UserMetrics, 
  NutritionProfile, 
  Goal, 
  MacroTargets, 
  HydrationLog, 
  CaloriesBurnedEntry, 
  MealEntry, 
  FoodSearchResult, 
  FoodItem, 
  MealCategory,
  DailyMealTimeline
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Apple, Terminal, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { streakEngine } from '../../athlete/services/streakEngine';
import { validateGeneratedMeal } from '../utils/validateGeneratedMeal';
import { normalizeAIError } from '../../../lib/errors/normalizeAIError';
import { buildHabitMomentum } from '../../athlete/utils/buildHabitMomentum';
import { behavioralContinuityEngine, BehavioralState } from '../../athlete/services/behavioralContinuityEngine';
import { weeklyRecoveryRhythmEngine, WeeklyRhythmState } from '../../athlete/services/weeklyRecoveryRhythmEngine';
import { snapshotManager } from '../../athlete-memory/services/snapshotManager';

export default function NutritionDashboardPage() {
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [activityHistory, setActivityHistory] = useState<CaloriesBurnedEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [timeline, setTimeline] = useState<DailyMealTimeline | null>(null);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState<Record<string, boolean>>({});
  const [behavioralState, setBehavioralState] = useState<BehavioralState | null>(null);
  const [weeklyRhythm, setWeeklyRhythm] = useState<WeeklyRhythmState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Coaching States
  const [coachingInsight, setCoachingInsight] = useState<CoachingInsight | null>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);

  // Search States
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const state = await nutritionPersistenceService.getProfileState();
      const hydration = await nutritionPersistenceService.getHydrationLogs();
      const activity = await nutritionPersistenceService.getCaloriesBurnedHistory();
      const mealLogs = await nutritionPersistenceService.getMeals();
      
      if (state.profile) {
        setProfile(state.profile);
      }
      setHydrationLogs(hydration);
      setActivityHistory(activity);
      setMeals(mealLogs);
      setIsLoading(false);

      // Load or generate timeline
      if (state.profile) {
        const todayStr = new Date().toISOString().split('T')[0];
        let todayTimeline = await nutritionPersistenceService.getTimelineByDate(todayStr);
        if (!todayTimeline) {
          // Generate deterministic timeline for today
          todayTimeline = timelineGenerationEngine.generate({
            date: todayStr,
            targets: state.profile.targets,
            recoveryScore: 80, // Default for now
            workoutIntensity: 'moderate' // Default for now
          });
          await nutritionPersistenceService.saveTimeline(todayTimeline);
        }
        setTimeline(todayTimeline);
        
        const timelines = await nutritionPersistenceService.getAllTimelines();
        const history = await snapshotManager.getAthleteHistory();
        const streaks = streakEngine.getStreaks();
        
        let recentSkippedMeals = 0;
        let recentCompletedMeals = 0;
        let recentRegenerations = 0;
        
        timelines.slice(-3).forEach(t => {
          t.slots.forEach((s: any) => {
             if (s.status === 'skipped') recentSkippedMeals++;
             if (s.status === 'completed' || s.status === 'ate_half') recentCompletedMeals++;
             if (s.regenerationCount) recentRegenerations += s.regenerationCount;
          });
        });

        const hydrationProportions = hydration.map(h => h.amountLiters);
        const hydrationTotal = hydrationProportions.reduce((a,b)=>a+b, 0);
        const hydrationConsistency = hydration.length ? Math.min(100, (hydrationTotal / (hydration.length || 1) / 2) * 100) : 0;
        
        const recoveryTrend = history.length > 0 ? (history.slice(-7).reduce((acc: number, h: any) => acc + h.recoveryScore, 0) / Math.min(history.length, 7)) : 0;
        
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
          recentLowRecoveryDays: history.slice(-3).filter((h: any) => h.recoveryScore < 50).length
        });
        setBehavioralState(bState);

        const avgMealCompletion = timelines.length ? timelines.reduce((acc, t) => {
           let completed = 0;
           t.slots.forEach((s: any) => { if(s.status === 'completed' || s.status === 'ate_half') completed++; });
           return acc + (t.slots.length > 0 ? (completed / t.slots.length) * 100 : 0);
        }, 0) / timelines.length : 0;
        
        const wRhythm = weeklyRecoveryRhythmEngine.detectRhythm({
          historyDays: history.length,
          avgMobilityAdherence: (streaks.mobilityCount / 7) * 100,
          avgHydrationConsistency: hydrationConsistency,
          avgMealCompletion,
          avgRecoveryScore: recoveryTrend,
          burnoutIndicators: (recentSkippedMeals > 2 ? 1 : 0) + (bState === 'overwhelmed' || bState === 'fatigued' ? 1 : 0),
          regenerationFrequency: recentRegenerations
        });
        setWeeklyRhythm(wRhythm);

        const bContext = behavioralContinuityEngine.getCoachingContext(bState);
        const context = buildNutritionInsightContext(state.profile, mealLogs, hydration, activity, bState, bContext, momentumMetrics.overallMomentum, wRhythm);
        handleFetchCoaching(context);
      }
    }
    loadData();
  }, []);

  const handleFetchCoaching = async (contextOverride?: any) => {
    if (!profile && !contextOverride) return;
    
    setIsCoachingLoading(true);
    try {
      const bContext = behavioralState ? behavioralContinuityEngine.getCoachingContext(behavioralState) : undefined;
      const context = contextOverride || buildNutritionInsightContext(profile!, meals, hydrationLogs, activityHistory, behavioralState || undefined, bContext, undefined, weeklyRhythm || undefined);
      const insight = await nutritionCoachingService.getDailyInsight(context);
      setCoachingInsight(insight);
    } catch (e) {
      console.error('Failed to fetch coaching insight', e);
    } finally {
      setIsCoachingLoading(false);
    }
  };

  const handleSaveMetrics = async (metrics: UserMetrics) => {
    const tdee = calculateTDEE(metrics);
    const goal: Goal = profile?.goal || 'maintenance';
    const targets = calculateMacroTargets(
      goal === 'fat_loss' ? tdee - 500 : goal === 'muscle_gain' ? tdee + 250 : tdee,
      goal,
      metrics.weight
    );
    const hydrationTarget = calculateHydration(metrics.weight);

    const newProfile: NutritionProfile = {
      ...metrics,
      goal,
      targets,
      hydrationTarget
    };

    setProfile(newProfile);
    await nutritionPersistenceService.saveProfileState({ profile: newProfile });

    // Refresh coaching with new profile
    const context = buildNutritionInsightContext(newProfile, meals, hydrationLogs, activityHistory);
    handleFetchCoaching(context);
  };

  const handleGenerateTimeline = async () => {
    if (!timeline) return;
    setIsGeneratingTimeline(true);
    
    const emptySlotIndices = timeline.slots
      .map((s, idx) => (!s.generatedRecipe && !s.loggedMealId ? idx : -1))
      .filter(idx => idx !== -1);

    if (emptySlotIndices.length === 0) {
      setIsGeneratingTimeline(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        emptySlotIndices.map(async (idx) => {
          const slot = timeline.slots[idx];
          const mode = adaptiveMealTimelineEngine.determineMode({
            recoveryScore: 80,
            workoutIntensity: 'moderate',
            hydrationAdherence: 80,
            recentSkippedMeals: 0,
            regenerationCount: slot.regenerationCount || 0,
            behavioralState: behavioralState || undefined,
            weeklyRhythm: weeklyRhythm || undefined
          });
          const modeContext = adaptiveMealTimelineEngine.getPromptContext(mode);

          const data = await mealGenerationService.generateMealTimeline({
            slots: [slot],
            recoveryScore: 80,
            workoutIntensity: 'moderate',
            loggedFoods: Array.from(new Set(meals.slice(-100).map((m) => m.name))).slice(0, 30),
            adaptiveMode: mode,
            adaptiveContext: modeContext
          });
          if (!data || !data.slots || data.slots.length === 0 || !data.slots[0].recipe) {
             throw new Error('Malformed response');
          }
          return { idx, recipe: data.slots[0].recipe };
        })
      );

      const updatedSlots = [...timeline.slots];
      let didUpdate = false;
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          updatedSlots[result.value.idx].generatedRecipe = result.value.recipe;
          didUpdate = true;
        } else {
           console.error('Failed to generate a slot:', normalizeAIError(result.reason));
        }
      });

      if (didUpdate) {
        const updatedTimeline = { ...timeline, slots: updatedSlots, isActive: true };
        setTimeline(updatedTimeline);
        await nutritionPersistenceService.saveTimeline(updatedTimeline);
      }
    } catch (e) {
      console.error('Failed to generate timeline', normalizeAIError(e));
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  const handleRegenerateSlot = async (idx: number) => {
    if (!timeline) return;
    const slot = timeline.slots[idx];
    if (slot.loggedMealId) return;

    setGeneratingSlots(prev => ({ ...prev, [idx]: true }));
    try {
      const mode = adaptiveMealTimelineEngine.determineMode({
        recoveryScore: 80,
        workoutIntensity: 'moderate',
        hydrationAdherence: 80,
        recentSkippedMeals: 0,
        regenerationCount: (slot.regenerationCount || 0) + 1,
        behavioralState: behavioralState || undefined,
        weeklyRhythm: weeklyRhythm || undefined
      });
      const modeContext = adaptiveMealTimelineEngine.getPromptContext(mode);

      const data = await mealGenerationService.generateMealTimeline({
        slots: [slot],
        recoveryScore: 80,
        workoutIntensity: 'moderate',
        loggedFoods: Array.from(new Set(meals.slice(-100).map((m) => m.name))).slice(0, 30),
        adaptiveMode: mode,
        adaptiveContext: modeContext
      });
      if (data && data.slots && data.slots.length > 0 && data.slots[0].recipe) {
        const updatedSlots = [...timeline.slots];
        updatedSlots[idx].generatedRecipe = data.slots[0].recipe;
        updatedSlots[idx].regenerationCount = (slot.regenerationCount || 0) + 1;
        const updatedTimeline = { ...timeline, slots: updatedSlots, isActive: true };
        setTimeline(updatedTimeline);
        await nutritionPersistenceService.saveTimeline(updatedTimeline);
      } else {
        throw new Error('Malformed response upon regeneration');
      }
    } catch (e) {
      console.error('Failed to regenerate slot', normalizeAIError(e));
    } finally {
      setGeneratingSlots(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleUpdateHydration = async (amount: number) => {
    const newLog: HydrationLog = {
      id: crypto.randomUUID(),
      amountLiters: amount,
      timestamp: Date.now()
    };
    await nutritionPersistenceService.logHydration(newLog);
    streakEngine.incrementHydrationStreak();
    const updated = await nutritionPersistenceService.getHydrationLogs();
    setHydrationLogs(updated);
    
    // Refresh coaching after hydration update
    if (profile) {
      const context = buildNutritionInsightContext(profile, meals, updated, activityHistory);
      handleFetchCoaching(context);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await nutritionApiService.searchFood(query);
      setSearchResults(data.results || []);
    } catch (e) {
      console.warn('Search failed', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = async (result: FoodSearchResult) => {
    try {
      const data = await nutritionApiService.getFoodDetails(result.id);
      if (data) {
        setSelectedFood(data.food);
      }
    } catch (e) {
      console.warn('Fetch food failed', e);
    }
  };

  const handleAddMeal = async (mealInfo: { amount: number; category: MealCategory }) => {
    if (!selectedFood) return;

    const newMeal: MealEntry = {
      id: crypto.randomUUID(),
      foodId: selectedFood.id,
      name: selectedFood.name,
      category: mealInfo.category,
      amount: mealInfo.amount,
      calories: Math.round(selectedFood.calories * mealInfo.amount),
      protein: Math.round(selectedFood.protein * mealInfo.amount * 10) / 10,
      carbs: Math.round(selectedFood.carbs * mealInfo.amount * 10) / 10,
      fat: Math.round(selectedFood.fat * mealInfo.amount * 10) / 10,
      timestamp: Date.now()
    };

    await nutritionPersistenceService.logMeal(newMeal);
    streakEngine.incrementNutritionStreak();
    const updated = await nutritionPersistenceService.getMeals();
    setMeals(updated);
    setSelectedFood(null);
    setSearchResults([]);

    // Refresh coaching after meal log
    if (profile) {
      const context = buildNutritionInsightContext(profile, updated, hydrationLogs, activityHistory);
      handleFetchCoaching(context);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    await nutritionPersistenceService.deleteMeal(id);
    const updated = await nutritionPersistenceService.getMeals();
    setMeals(updated);
  };

  const dailyHydration = hydrationLogs
    .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + log.amountLiters, 0);

  const dailyActivity = activityHistory
    .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + log.calories, 0);

  const dailyMeals = meals.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString());
  
  const dailyTotals = dailyMeals.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    protein: acc.protein + curr.protein,
    carbs: acc.carbs + curr.carbs,
    fat: acc.fat + curr.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const recentActivity = activityHistory.length > 0 ? activityHistory[activityHistory.length - 1] : null;

  const timelineInsights = timeline ? buildMealTimelineInsights([timeline], hydrationLogs) : [];

  const handleSlotStatusUpdate = async (slot: any, idx: number, status: 'skipped' | 'ate_half' | 'completed') => {
    if (!profile || !timeline || !slot.generatedRecipe) return;

    if (status === 'completed' || status === 'ate_half') {
      const fraction = status === 'ate_half' ? 0.5 : 1.0;
      const calories = (Number(slot.targetCalories) || 0) * fraction;
      const protein = (Number(slot.targetProtein) || 0) * fraction;
      const carbs = (Number(slot.targetCarbs) || 0) * fraction;
      const fat = (Number(slot.targetFat) || 0) * fraction;

      const newMeal: MealEntry = {
        id: crypto.randomUUID(),
        foodId: crypto.randomUUID(),
        amount: fraction,
        category: slot.category,
        name: String(slot.generatedRecipe.title || 'Timeline Meal') + (fraction === 0.5 ? ' (Half)' : ''),
        calories,
        protein,
        carbs,
        fat,
        timestamp: Date.now()
      };

      await nutritionPersistenceService.logMeal(newMeal);
      streakEngine.incrementNutritionStreak();
      
      const updatedMeals = await nutritionPersistenceService.getMeals();
      setMeals(updatedMeals);
      
      const newContext = buildNutritionInsightContext(profile, updatedMeals, hydrationLogs, activityHistory);
      handleFetchCoaching(newContext);

      const updatedSlots = [...timeline.slots];
      updatedSlots[idx].loggedMealId = newMeal.id;
      updatedSlots[idx].status = status;
      const updatedTimeline = { ...timeline, slots: updatedSlots, isActive: true };
      setTimeline(updatedTimeline);
      await nutritionPersistenceService.saveTimeline(updatedTimeline);
    } else if (status === 'skipped') {
      const updatedSlots = [...timeline.slots];
      updatedSlots[idx].status = 'skipped';
      const updatedTimeline = { ...timeline, slots: updatedSlots, isActive: true };
      setTimeline(updatedTimeline);
      await nutritionPersistenceService.saveTimeline(updatedTimeline);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-gold">
      <NutritionHeader title="Elite Nutrition" />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - User Stats & Core Profile */}
          <div className="space-y-8 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MetricsCard 
                initialMetrics={profile} 
                onSave={handleSaveMetrics} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HydrationCard 
                target={profile?.hydrationTarget || 2.5}
                current={dailyHydration}
                onUpdate={handleUpdateHydration}
              />
            </motion.div>

            {profile && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <RecoveryInsightCard 
                    hydrationPercent={Math.round((dailyHydration / profile.hydrationTarget) * 100)}
                    proteinPercent={Math.round((dailyTotals.protein / profile.targets.protein) * 100)}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <HabitStreakCard days={1} />
                </motion.div>
              </>
            )}

            {/* Quick Stats Summary */}
            <div className="bg-charcoal text-cream/40 rounded-2xl p-6 font-mono text-[10px] uppercase tracking-widest border border-cream/5">
              <div className="flex justify-between mb-2">
                <span>Database Sync</span>
                <span className="text-gold">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Schema v1.2</span>
                <span>Deterministic</span>
              </div>
            </div>
          </div>

          {/* Right Columns - Search & Journal */}
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            {!profile ? (
              <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gold/20">
                <Apple className="w-12 h-12 text-gold mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-medium text-charcoal mb-4">Initialize Your Profile</h3>
                <p className="text-charcoal/60 mb-8 max-w-md mx-auto">To generate your elite nutrition plan and track your metrics, please enter your body stats.</p>
                <div className="animate-bounce inline-block text-gold">
                  <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <NutritionCoachCard 
                    insight={coachingInsight}
                    isLoading={isCoachingLoading}
                    onRefresh={() => handleFetchCoaching()}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <DailyOverviewCard 
                    goal={profile.goal}
                    netCalories={Math.round(profile.targets.calories - dailyTotals.calories + dailyActivity)}
                    maintenanceCalories={Math.round(calculateTDEE(profile))}
                  />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MacroSummaryCard 
                      targets={profile.targets}
                      current={dailyTotals}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CaloriesBurnedCard 
                      totalBurned={dailyActivity}
                      recentActivity={recentActivity ? {
                        name: recentActivity.activityName,
                        calories: recentActivity.calories,
                        timestamp: recentActivity.timestamp
                      } : null}
                    />
                  </motion.div>
                </div>

                {/* Food Search Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Search className="w-5 h-5 text-gold" />
                    <h2 className="text-xl font-serif font-medium text-charcoal">Quick Log</h2>
                  </div>
                  
                  <div className="relative">
                    <FoodSearchBar 
                      onSearch={handleSearch} 
                      isLoading={isSearching} 
                    />
                    
                    <div className="absolute top-full left-0 right-0 z-40 mt-2">
                      <FoodSearchResults 
                        results={searchResults} 
                        onSelect={handleSelectFood}
                        onAddQuick={(item) => handleSelectFood(item)} // For now, both open sheet
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <GenerateMealCard
                    context={buildMealGenerationContext(profile!, dailyMeals, hydrationLogs, activityHistory)}
                    loggedFoods={Array.from(
                      new Set(meals.slice(-100).map((m) => m.name))
                    ).slice(0, 30)}
                    onAddMeal={(mealInfo) => {
                      const newMeal: MealEntry = {
                        id: crypto.randomUUID(),
                        foodId: 'ai-generated-' + Math.random(),
                        name: mealInfo.name,
                        category: mealInfo.category,
                        amount: mealInfo.amount,
                        calories: mealInfo.calories,
                        protein: mealInfo.protein,
                        carbs: mealInfo.carbs,
                        fat: mealInfo.fat,
                        timestamp: Date.now()
                      };
                      nutritionPersistenceService.logMeal(newMeal).then(() => {
                        streakEngine.incrementNutritionStreak();
                        nutritionPersistenceService.getMeals().then(updated => {
                          setMeals(updated);
                          const newContext = buildNutritionInsightContext(profile, updated, hydrationLogs, activityHistory);
                          handleFetchCoaching(newContext);
                        });
                      });
                    }}
                  />
                </motion.div>

                {timeline && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 pt-4"
                  >
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gold" />
                        <h2 className="text-xl font-serif font-medium text-charcoal">Daily Meal Timeline</h2>
                      </div>
                      <button
                        onClick={handleGenerateTimeline}
                        disabled={isGeneratingTimeline}
                        className="px-4 py-2 bg-charcoal text-cream text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50"
                      >
                        {isGeneratingTimeline ? 'Generating...' : 'Fill Timeline'}
                      </button>
                    </div>
                    {timelineInsights.length > 0 && (
                      <div className="px-4 py-3 bg-cream/30 border border-cream rounded-2xl flex flex-col gap-2">
                        {timelineInsights.map((insight, i) => (
                           <p key={i} className="text-xs text-charcoal/70 font-medium leading-relaxed flex gap-2">
                             <span className="text-gold">✨</span> {insight}
                           </p>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {timeline.slots.map((slot, idx) => {
                        const isGenerating = generatingSlots[idx];
                        const validation = slot.generatedRecipe ? validateGeneratedMeal(slot.generatedRecipe, slot) : null;
                        
                        return (
                          <div key={`${slot.category}-${idx}`} className="bg-white rounded-2xl p-5 border border-cream shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                            <div className="flex justify-between items-center border-b border-cream/50 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold uppercase tracking-widest text-charcoal">{slot.category.replace('_', ' ')}</span>
                                {(slot.regenerationCount || 0) > 0 && slot.generatedRecipe && !isGenerating && (
                                  <span className="text-[8px] bg-charcoal/80 text-cream px-1.5 py-0.5 rounded-sm uppercase tracking-widest font-bold">
                                    Adapted x{slot.regenerationCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {slot.plannedTime && <span className="text-xs text-charcoal/40 font-mono">{slot.plannedTime}</span>}
                                {slot.generatedRecipe && !slot.loggedMealId && (
                                  <button onClick={() => handleRegenerateSlot(idx)} disabled={isGenerating} className="text-charcoal/30 hover:text-charcoal transition-colors disabled:opacity-50">
                                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Generated Recipe Rendering safely */}
                            {isGenerating && !slot.generatedRecipe && (
                              <div className="py-4 space-y-3 animate-pulse">
                                <div className="h-5 bg-cream rounded w-3/4"></div>
                                <div className="h-3 bg-cream rounded w-1/2"></div>
                              </div>
                            )}
                            
                            {!isGenerating && !slot.generatedRecipe && !slot.loggedMealId && (
                              <div className="py-6 flex flex-col items-center justify-center border border-dashed border-cream rounded-lg bg-cream/10 my-2">
                                <p className="text-xs text-charcoal/40 mb-2 font-medium">Slot Empty</p>
                                <button 
                                  onClick={() => handleRegenerateSlot(idx)} 
                                  className="text-[10px] text-charcoal/60 hover:text-charcoal bg-white border border-cream shadow-sm px-3 py-1 rounded-full transition-colors uppercase font-bold tracking-wider"
                                >
                                  Generate Idea
                                </button>
                              </div>
                            )}
                            
                            {slot.generatedRecipe && !isGenerating && (
                              <div className="py-2 space-y-2">
                                 <div className="flex justify-between items-start">
                                   <h3 className="font-serif text-lg text-charcoal pr-2 leading-tight">{slot.generatedRecipe.title}</h3>
                                   {slot.generatedRecipe.estimatedPrepTime && (
                                     <span className="shrink-0 bg-cream/50 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md text-charcoal/60 mt-1">
                                        {slot.generatedRecipe.estimatedPrepTime}
                                     </span>
                                   )}
                                 </div>
                                 
                                 {validation && validation.warnings.length > 0 && (
                                   <div className="flex items-start gap-2 bg-orange-50/50 text-orange-800 p-2 rounded-lg text-xs">
                                     <AlertTriangle className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                                     <div>
                                       <span className="font-bold border-b border-orange-200 block mb-1">AI Match Confidence: {validation.confidenceScore}%</span>
                                       {validation.warnings.map((w, i) => <div key={i}>{w}</div>)}
                                     </div>
                                   </div>
                                 )}

                                 {slot.generatedRecipe.tags && slot.generatedRecipe.tags.length > 0 && (
                                   <div className="flex flex-wrap gap-1 mt-1">
                                     {slot.generatedRecipe.tags.slice(0,3).map((tag, i) => (
                                        <span key={i} className="text-[9px] uppercase font-bold text-charcoal/50 bg-charcoal/5 px-1.5 py-0.5 rounded-sm">
                                          {tag}
                                        </span>
                                     ))}
                                   </div>
                                 )}
                                 
                                 <details className="text-xs text-charcoal/70 cursor-pointer group mt-2">
                                   <summary className="font-medium outline-none">View Ingredients</summary>
                                   <ul className="list-disc pl-4 mt-1 space-y-0.5 text-charcoal/60">
                                      {slot.generatedRecipe.ingredients?.map((ing, i) => (
                                        <li key={i}>{ing}</li>
                                      ))}
                                   </ul>
                                 </details>
                              </div>
                            )}

                            <div className="grid grid-cols-4 gap-2 pt-2 text-center border-t border-cream/50 mt-auto">
                              <div>
                                 <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Kcal</div>
                                 <div className="text-sm font-black text-charcoal">{slot.targetCalories}</div>
                              </div>
                              <div>
                                 <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Pro</div>
                                 <div className="text-sm font-black text-blue-500">{slot.targetProtein}g</div>
                              </div>
                              <div>
                                 <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Carb</div>
                                 <div className="text-sm font-black text-green-500">{slot.targetCarbs}g</div>
                              </div>
                              <div>
                                 <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Fat</div>
                                 <div className="text-sm font-black text-orange-500">{slot.targetFat}g</div>
                              </div>
                            </div>
                            
                            {slot.generatedRecipe && !slot.loggedMealId && slot.status !== 'skipped' && (
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <button
                                   onClick={() => handleSlotStatusUpdate(slot, idx, 'skipped')}
                                   disabled={isGenerating}
                                   className="flex-1 py-2 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/70 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                                >
                                   Skip
                                </button>
                                <button
                                   onClick={() => handleSlotStatusUpdate(slot, idx, 'ate_half')}
                                   disabled={isGenerating}
                                   className="flex-1 py-2 bg-gold/5 hover:bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                                >
                                   ½ Portion
                                </button>
                                <button
                                   onClick={() => handleSlotStatusUpdate(slot, idx, 'completed')}
                                   disabled={isGenerating}
                                   className="flex-1 py-2 bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                                >
                                   Complete
                                </button>
                              </div>
                            )}
                            {(slot.loggedMealId || slot.status === 'skipped') && (
                              <div className={`mt-3 w-full py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl ${slot.status === 'skipped' ? 'bg-charcoal/5 text-charcoal/50' : slot.status === 'ate_half' ? 'bg-gold/10 text-gold' : 'bg-green-500/10 text-green-600'}`}>
                                 {slot.status === 'skipped' ? 'Skipped' : slot.status === 'ate_half' ? '½ Logged' : 'Completed'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Journal Section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-gold" />
                      <h2 className="text-xl font-serif font-medium text-charcoal">Nutrition Journal</h2>
                    </div>
                    {dailyMeals.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to clear your daily log? This cannot be undone.')) {
                            dailyMeals.forEach(m => handleDeleteMeal(m.id));
                          }
                        }}
                        className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Clear Day
                      </button>
                    )}
                  </div>
                  <NutritionJournal 
                    meals={dailyMeals} 
                    onDelete={handleDeleteMeal} 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Food Details Overlay */}
      <AnimatePresence>
        {selectedFood && (
          <FoodDetailSheet 
            food={selectedFood}
            onClose={() => setSelectedFood(null)}
            onAdd={handleAddMeal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
