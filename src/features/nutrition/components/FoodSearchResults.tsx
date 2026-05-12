import React from 'react';
import { FoodSearchResult } from '../types';
import { Plus, Info, Image as ImageIcon } from 'lucide-react';

interface FoodSearchResultsProps {
  results: FoodSearchResult[];
  onSelect: (item: FoodSearchResult) => void;
  onAddQuick: (item: FoodSearchResult) => void;
}

export function FoodSearchResults({ results, onSelect, onAddQuick }: FoodSearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gold/10 overflow-hidden divide-y divide-gold/5 max-h-[400px] overflow-y-auto">
      {results.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center justify-between p-4 hover:bg-gold/5 transition-colors group"
        >
          <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onSelect(item)}>
            <div className="w-12 h-12 rounded-lg bg-cream flex items-center justify-center overflow-hidden flex-shrink-0 text-charcoal/20">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-charcoal leading-tight">{item.name}</h4>
              <p className="text-xs text-charcoal/40 uppercase tracking-widest mt-1">
                {item.brand || 'Generic'} • {item.calories} kcal
              </p>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] text-orange-600 font-bold">P: {item.protein}g</span>
                <span className="text-[10px] text-blue-600 font-bold">C: {item.carbs}g</span>
                <span className="text-[10px] text-yellow-600 font-bold">F: {item.fat}g</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(item)}
              className="p-2 text-charcoal/30 hover:text-charcoal hover:bg-gold/10 rounded-lg transition-all"
              title="View Details"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => onAddQuick(item)}
              className="p-2 text-gold hover:bg-gold hover:text-charcoal rounded-lg transition-all"
              title="Quick Add"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
