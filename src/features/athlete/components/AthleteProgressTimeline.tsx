import React from 'react';
import { motion } from 'motion/react';
import { WorkoutReport } from '../../../lib/reports';

interface AthleteProgressTimelineProps {
  reports: WorkoutReport[];
}

export function AthleteProgressTimeline({ reports }: AthleteProgressTimelineProps) {
  // Sort reports by date descending, take last 5
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cream/40 mb-8">Progress Timeline</h3>
      
      <div className="space-y-6 relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-white/5" />
        
        {recentReports.map((report, idx) => (
          <div key={report.id} className="relative flex gap-6 items-start group">
            <div className="mt-1.5 w-6 h-6 rounded-full bg-charcoal border-2 border-gold flex items-center justify-center shrink-0 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            </div>
            
            <div className="space-y-2 pb-6 border-b border-white/5 flex-1 group-last:border-0">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-white italic">{new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                 <span className="text-[10px] uppercase tracking-widest text-cream/30">{report.durationMinutes}m Flow</span>
              </div>
              <p className="text-xs text-cream/60 leading-relaxed font-serif italic">
                Completed {report.exercisesCompleted.length} movements focused on mobility expansion. 
                Pacing: {report.perceivedExertion > 6 ? 'High Intensity' : 'Restorative'}.
              </p>
            </div>
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-cream/20 font-serif italic">No mobility history recorded yet. Begin your first flow to initialize timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
