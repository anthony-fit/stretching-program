import { DailyMealTimeline, HydrationLog } from '../types';

export function buildMealTimelineInsights(
  timelines: DailyMealTimeline[],
  hydrationLogs: HydrationLog[]
): string[] {
  const insights: string[] = [];
  
  if (!timelines || timelines.length === 0) return insights;

  let totalSlots = 0;
  let skippedSlots = 0;
  let skippedBreakfasts = 0;
  let totalBreakfasts = 0;

  let completedSlots = 0;

  for (const t of timelines) {
    for (const s of t.slots) {
      totalSlots++;
      if (s.status === 'skipped') skippedSlots++;
      if (s.status === 'completed') completedSlots++;

      if (s.category === 'breakfast') {
        totalBreakfasts++;
        if (s.status === 'skipped') skippedBreakfasts++;
      }
    }
  }

  // Basic hydration calculation
  // In a real app we'd group hydration by day, but let's do a simple overall metric for this demo layer.
  const hydrationTotal = hydrationLogs.reduce((acc, log) => acc + log.amountLiters, 0);
  const avgHydrationPerDay = hydrationLogs.length > 0 ? hydrationTotal / (new Set(hydrationLogs.map(h => new Date(h.timestamp).toDateString())).size || 1) : 0;
  const isHydratedWell = avgHydrationPerDay > 2; 

  if (totalBreakfasts > 0 && skippedBreakfasts >= totalBreakfasts * 0.5) {
    insights.push("You skip breakfast frequently. Shifting macros to lunch or opting for 2-minute recipes could help.");
  }
  
  if (totalSlots > 0 && skippedSlots > totalSlots * 0.3) {
    insights.push("Meal completion is below 70%. We're switching to 'low-fatigue' recipes to help keep you on track.");
  }

  if (totalSlots > 0 && isHydratedWell && (completedSlots / totalSlots) > 0.6) {
    insights.push("Strong hydration is correlating with high meal completion. Keep the momentum!");
  } else if (totalSlots > 0 && !isHydratedWell && (skippedSlots / totalSlots) > 0.3) {
    insights.push("Lower water intake often pairs with missed meals. Staying hydrated improves baseline energy for meal prep.");
  }

  return insights;
}
