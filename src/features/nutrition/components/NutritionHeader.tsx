import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NutritionHeaderProps {
  title: string;
  showBack?: boolean;
}

export function NutritionHeader({ title, showBack }: NutritionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-charcoal text-cream py-6 px-4 md:px-8 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gold/20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}
