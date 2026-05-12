import React from 'react';
import { MealEntry, MealCategory } from '../types';
import { Coffee, Cloud, Moon, Pizza, Trash2, Clock } from 'lucide-react';

interface NutritionJournalProps {
  meals: MealEntry[];
  onDelete: (id: string) => void;
}

export function NutritionJournal({ meals, onDelete }: NutritionJournalProps) {
  const categories: { id: MealCategory; label: string; icon: any }[] = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Cloud },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snack', label: 'Snacks', icon: Pizza },
  ];

  const groupedMeals = categories.map(cat => ({
    ...cat,
    entries: meals.filter(m => m.category === cat.id)
  }));

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gold/10">
        <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-charcoal/20" />
        </div>
        <h3 className="text-xl font-serif font-medium text-charcoal mb-2">No Meals Logged</h3>
        <p className="text-charcoal/40 text-sm max-w-xs mx-auto italic">Start by searching and adding foods to your daily journal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedMeals.map((group) => {
        if (group.entries.length === 0) return null;

        const groupTotals = group.entries.reduce((acc, curr) => ({
          calories: acc.calories + curr.calories,
          protein: acc.protein + curr.protein,
          carbs: acc.carbs + curr.carbs,
          fat: acc.fat + curr.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-charcoal text-cream rounded-lg flex items-center justify-center">
                  <group.icon className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal">{group.label}</h3>
              </div>
              <div className="text-right">
                 <span className="text-xs font-bold text-charcoal uppercase tracking-widest">{Math.round(groupTotals.calories)} kcal</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gold/10 overflow-hidden divide-y divide-gold/5">
              {group.entries.map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gold/5 transition-colors group/item">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-charcoal/30 font-mono transition-colors group-hover/item:text-gold">{formatTime(entry.timestamp)}</span>
                      <h4 className="font-bold text-charcoal text-sm leading-tight">{entry.name}</h4>
                    </div>
                    <div className="flex gap-4">
                       <span className="text-[10px] text-charcoal/40 uppercase tracking-widest font-medium">Qty: {entry.amount}</span>
                       <div className="flex gap-3">
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest leading-none bg-orange-50 px-1.5 py-0.5 rounded">P: {entry.protein}g</span>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none bg-blue-50 px-1.5 py-0.5 rounded">C: {entry.carbs}g</span>
                        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest leading-none bg-yellow-50 px-1.5 py-0.5 rounded">F: {entry.fat}g</span>
                       </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-charcoal/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/item:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
