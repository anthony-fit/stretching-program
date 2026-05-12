import React from 'react';
import { MacroTargets } from '../types';

interface MacroSummaryCardProps {
  targets: MacroTargets;
  current: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

export function MacroSummaryCard({ targets, current }: MacroSummaryCardProps) {
  const calculatePercentage = (val: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((val / target) * 100), 100);
  };

  const macros = [
    { label: 'Protein', value: current.protein, target: targets.protein, color: 'bg-gold', unit: 'g' },
    { label: 'Carbs', value: current.carbs, target: targets.carbs, color: 'bg-charcoal', unit: 'g' },
    { label: 'Fat', value: current.fat, target: targets.fat, color: 'bg-charcoal/40', unit: 'g' },
  ];

  const caloriesProgress = calculatePercentage(current.calories, targets.calories);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif font-medium text-charcoal">Daily Macros</h2>
          <p className="text-sm text-charcoal/60">Track your intake</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-charcoal">{current.calories}</div>
          <div className="text-xs font-medium text-charcoal/40 uppercase tracking-widest">/ {targets.calories} kcal</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calories Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
            <span>Total Calories</span>
            <span>{caloriesProgress}%</span>
          </div>
          <div className="h-3 w-full bg-cream rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold transition-all duration-500 ease-out"
              style={{ width: `${caloriesProgress}%` }}
            />
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-1 gap-4">
          {macros.map((macro) => {
            const percentage = calculatePercentage(macro.value, macro.target);
            return (
              <div key={macro.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-bold text-charcoal">{macro.label}</span>
                    <span className="text-xs text-charcoal/40 ml-2">{macro.value}{macro.unit} / {macro.target}{macro.unit}</span>
                  </div>
                  <span className="text-xs font-medium text-charcoal/60">{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-cream rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${macro.color} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
