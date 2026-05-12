import React, { useState, useEffect } from 'react';
import { X, Scale, Calculator, Plus, ArrowRight } from 'lucide-react';
import { FoodItem, MealCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FoodDetailSheetProps {
  food: FoodItem | null;
  onClose: () => void;
  onAdd: (mealInfo: { amount: number; category: MealCategory }) => void;
}

export function FoodDetailSheet({ food, onClose, onAdd }: FoodDetailSheetProps) {
  const [amount, setAmount] = useState<any>(1);
  const [category, setCategory] = useState<MealCategory>('breakfast');

  useEffect(() => {
    // Basic auto-assignment of category based on time of day
    const hour = new Date().getHours();
    if (hour < 11) setCategory('breakfast');
    else if (hour < 15) setCategory('lunch');
    else if (hour < 19) setCategory('dinner');
    else setCategory('snack');
  }, [food]);

  if (!food) return null;

  const safeAmount = Number(amount) || 0;
  const scaledNutrients = {
    calories: Math.round(food.calories * safeAmount),
    protein: Math.round(food.protein * safeAmount * 10) / 10,
    carbs: Math.round(food.carbs * safeAmount * 10) / 10,
    fat: Math.round(food.fat * safeAmount * 10) / 10,
  };

  const categories: { id: MealCategory; label: string }[] = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-6 border-b border-gold/10 flex items-center justify-between">
          <h3 className="text-xl font-serif font-medium text-charcoal">Log Nutrition</h3>
          <button onClick={onClose} className="p-2 hover:bg-gold/10 rounded-full text-charcoal/40 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-charcoal leading-tight mb-1">{food.name}</h2>
            <p className="text-sm text-charcoal/40 uppercase tracking-widest">{food.brand || 'Generic Source'}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-cream rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-charcoal/40 uppercase block mb-1">Cals</span>
              <span className="text-lg font-bold text-charcoal">{scaledNutrients.calories}</span>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-orange-600/60 uppercase block mb-1">Prot</span>
              <span className="text-lg font-bold text-orange-600">{scaledNutrients.protein}g</span>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-blue-600/60 uppercase block mb-1">Carb</span>
              <span className="text-lg font-bold text-blue-600">{scaledNutrients.carbs}g</span>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-yellow-600/60 uppercase block mb-1">Fat</span>
              <span className="text-lg font-bold text-yellow-600">{scaledNutrients.fat}g</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">Meal category</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      category === cat.id 
                        ? 'bg-charcoal text-cream border-charcoal' 
                        : 'bg-white text-charcoal/60 border-gold/10 hover:border-gold/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <label className="text-xs font-bold text-charcoal/40 uppercase tracking-widest ml-1">Serving size</label>
                <span className="text-xs font-medium text-charcoal/60 italic">Standard: {food.servingSize}{food.servingUnit}</span>
              </div>
              <div className="relative">
                <Scale className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
                <input
                  type="number"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-cream/50 border border-charcoal/10 rounded-2xl pl-14 pr-24 py-4 text-xl font-bold outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all text-charcoal"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-charcoal/40 uppercase">
                  Multiplier
                </div>
              </div>
              <p className="text-[10px] text-charcoal/40 mt-1 ml-1 leading-relaxed">
                *Adjust multiplier to match your serving. 1.0 = {food.servingSize}{food.servingUnit}
              </p>
            </div>
          </div>

          <button
            onClick={() => onAdd({ amount: Number(amount) || 0, category })}
            className="w-full bg-gold text-charcoal font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:bg-gold/90 transition-all flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
          >
            <span>Log to {category}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
