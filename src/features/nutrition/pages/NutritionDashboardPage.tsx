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
import { nutritionPersistenceService } from '../services/nutritionPersistenceService';
import { nutritionCoachingService, CoachingInsight } from '../services/nutritionCoachingService';
import { nutritionApiService } from '../adapters';
import { buildNutritionInsightContext } from '../services/buildNutritionInsightContext';
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
  MealCategory 
} from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, History, Apple, Terminal } from 'lucide-react';
import { streakEngine } from '../../athlete/services/streakEngine';

export default function NutritionDashboardPage() {
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [activityHistory, setActivityHistory] = useState<CaloriesBurnedEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
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

      // Initial Coaching Insight
      if (state.profile) {
        const context = buildNutritionInsightContext(state.profile, mealLogs, hydration, activity);
        handleFetchCoaching(context);
      }
    }
    loadData();
  }, []);

  const handleFetchCoaching = async (contextOverride?: any) => {
    if (!profile && !contextOverride) return;
    
    setIsCoachingLoading(true);
    try {
      const context = contextOverride || buildNutritionInsightContext(profile!, meals, hydrationLogs, activityHistory);
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
