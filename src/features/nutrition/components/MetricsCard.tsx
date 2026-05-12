import React, { useState } from 'react';
import { UserMetrics, Gender, ActivityLevel } from '../types';
import { Scale, Ruler, User, Activity } from 'lucide-react';

interface MetricsCardProps {
  initialMetrics: UserMetrics | null;
  onSave: (metrics: UserMetrics) => void;
}

export function MetricsCard({ initialMetrics, onSave }: MetricsCardProps) {
  const [metrics, setMetrics] = useState<any>({
    age: initialMetrics?.age?.toString() || '30',
    weight: initialMetrics?.weight?.toString() || '70',
    height: initialMetrics?.height?.toString() || '170',
    gender: initialMetrics?.gender || 'male',
    activityLevel: initialMetrics?.activityLevel || 'moderately_active'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetrics((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      age: Number(metrics.age) || 0,
      weight: Number(metrics.weight) || 0,
      height: Number(metrics.height) || 0,
      gender: metrics.gender,
      activityLevel: metrics.activityLevel
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-serif font-medium text-charcoal">Body Metrics</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider ml-1">Age</label>
            <div className="relative">
              <input
                type="number"
                name="age"
                value={metrics.age}
                onChange={handleChange}
                className="w-full bg-cream/50 border border-charcoal/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-charcoal"
                min="13"
                max="120"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider ml-1">Gender</label>
            <select
              name="gender"
              value={metrics.gender}
              onChange={handleChange}
              className="w-full bg-cream/50 border border-charcoal/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all appearance-none text-charcoal"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider ml-1">Weight (kg)</label>
            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="number"
                name="weight"
                value={metrics.weight}
                onChange={handleChange}
                className="w-full bg-cream/50 border border-charcoal/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-charcoal"
                min="30"
                max="300"
                step="0.1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider ml-1">Height (cm)</label>
            <div className="relative">
              <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="number"
                name="height"
                value={metrics.height}
                onChange={handleChange}
                className="w-full bg-cream/50 border border-charcoal/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all text-charcoal"
                min="100"
                max="250"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider ml-1">Activity Level</label>
          <div className="relative">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
            <select
              name="activityLevel"
              value={metrics.activityLevel}
              onChange={handleChange}
              className="w-full bg-cream/50 border border-charcoal/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all appearance-none text-charcoal"
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extra_active">Extra Active</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-charcoal text-cream font-medium uppercase tracking-wider py-4 rounded-xl hover:bg-charcoal/90 transition-all shadow-lg active:scale-[0.98] mt-2"
        >
          Update Stats
        </button>
      </form>
    </div>
  );
}
