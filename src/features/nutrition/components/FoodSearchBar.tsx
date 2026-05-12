import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface FoodSearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function FoodSearchBar({ onSearch, isLoading }: FoodSearchBarProps) {
  const [query, setQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (value.length >= 2) {
        onSearch(value);
      }
    }, 500);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>
      
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search 1,000,000+ foods (e.g. Greek Yogurt)"
        className="w-full bg-white border border-gold/10 rounded-2xl pl-12 pr-12 py-5 text-lg outline-none focus:ring-4 focus:ring-gold/10 focus:border-gold transition-all shadow-sm group-hover:border-gold/30 text-charcoal"
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gold/10 rounded-full text-charcoal/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
