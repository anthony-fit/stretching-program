import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Utensils, X, Clock, Flame } from 'lucide-react';
import { MealGenerationContext } from '../services/buildMealGenerationContext';
import { mealGenerationService, GeneratedMeal } from '../services/mealGenerationService';
import { MealCategory } from '../types';

interface Props {
  context: MealGenerationContext;
  onAddMeal: (mealInfo: {
    category: MealCategory;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    amount: number;
  }) => void;
  loggedFoods: string[];
}

export function GenerateMealCard({ context, onAddMeal, loggedFoods }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeals, setGeneratedMeals] = useState<GeneratedMeal[]>([]);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState<string>('Any');

  const handleGenerate = async (useLoggedFoods: boolean) => {
    setIsGenerating(true);
    setError('');
    
    try {
      const promptContext = { ...context };
      promptContext.options = {
        ...promptContext.options,
        mealType: mealType as any,
        availableIngredients: useLoggedFoods ? loggedFoods : []
      };

      const result = await mealGenerationService.generateMeals(promptContext);
      if (result && result.meals && result.meals.length > 0) {
        setGeneratedMeals(result.meals);
      } else {
        setError('Could not generate meals. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addMealToJournal = (meal: GeneratedMeal) => {
    // We map custom meal types to MealCategory
    let cat: MealCategory = 'snack';
    if (mealType.toLowerCase().includes('breakfast')) cat = 'breakfast';
    if (mealType.toLowerCase().includes('lunch')) cat = 'lunch';
    if (mealType.toLowerCase().includes('dinner')) cat = 'dinner';
    if (mealType === 'Any') cat = 'lunch'; // default assumption
    
    onAddMeal({
      category: cat,
      name: String(meal.title || 'Unknown Meal'),
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,
      amount: 1
    });
    
    // remove from list once added
    setGeneratedMeals(prev => prev.filter(m => m.title !== meal.title));
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group border border-cream/20">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Sparkles className="w-32 h-32 text-charcoal transform rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gold/10 p-3 rounded-2xl">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-medium text-charcoal">AI Meal Orchestration</h3>
            <p className="text-xs text-charcoal/40 font-medium uppercase tracking-widest mt-1">Adaptive Engine Active</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl mb-6">
             {error}
          </div>
        )}

        {generatedMeals.length === 0 ? (
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2 text-sm">
                <select 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value)}
                  className="bg-cream/50 border-none rounded-xl px-4 py-2 font-medium text-charcoal focus:ring-2 focus:ring-gold outline-none"
                >
                  <option value="Any">Any Meal Types</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="recovery">Recovery Meal</option>
                </select>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating}
                  className="flex-1 bg-charcoal text-white hover:bg-charcoal/90 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Utensils className="w-4 h-4" />
                      Create Plan
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating || loggedFoods.length === 0}
                  className="flex-1 bg-gold text-charcoal hover:bg-gold/90 disabled:opacity-50 px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
                  ) : (
                    'Generate From Logged Foods'
                  )}
                </button>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-serif font-medium text-lg">Suggested Meals</h4>
              <button 
                onClick={() => setGeneratedMeals([])}
                className="p-2 hover:bg-cream/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-charcoal/60" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedMeals.map((meal, idx) => (
                <div key={idx} className="bg-cream/30 rounded-2xl p-5 border border-cream hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-charcoal flex-1 pr-4">{meal.title}</h5>
                    <button 
                      onClick={() => addMealToJournal(meal)}
                      className="bg-gold text-charcoal text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 hover:bg-gold/80"
                    >
                      Log It
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {meal.tags?.slice(0,3).map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-charcoal/40 bg-white px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded-full flex gap-1 items-center">
                       <Clock className="w-3 h-3" /> {meal.prepTime}m
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Kcal</div>
                      <div className="text-sm font-black text-charcoal">{meal.calories}</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Pro</div>
                      <div className="text-sm font-black text-blue-500">{meal.protein}g</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Carb</div>
                      <div className="text-sm font-black text-green-500">{meal.carbs}g</div>
                    </div>
                    <div className="bg-white rounded-xl p-2">
                      <div className="text-[10px] text-charcoal/40 font-bold uppercase mb-1">Fat</div>
                      <div className="text-sm font-black text-orange-500">{meal.fat}g</div>
                    </div>
                  </div>

                  {meal.ingredients && meal.ingredients.length > 0 && (
                     <div className="mb-4">
                       <div className="text-[10px] font-black tracking-widest uppercase text-charcoal/40 mb-2">Ingredients</div>
                       <ul className="text-xs text-charcoal/60 space-y-1 ml-4 list-disc">
                         {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                       </ul>
                     </div>
                  )}

                  {meal.steps && meal.steps.length > 0 && (
                     <div>
                       <div className="text-[10px] font-black tracking-widest uppercase text-charcoal/40 mb-2">Prep</div>
                       <ol className="text-xs text-charcoal/60 space-y-1 ml-4 list-decimal">
                         {meal.steps.map((st, i) => <li key={i}>{st}</li>)}
                       </ol>
                     </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
