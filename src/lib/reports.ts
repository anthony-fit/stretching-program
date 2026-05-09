import { OverallAssessment } from "./assessments";

export interface WorkoutReport {
  id: string;
  userId: string;
  date: string;
  durationMinutes: number;
  exercisesCompleted: string[];
  perceivedExertion: number; // 1-10
  formQualityScore: number; // 1-100
  coachingSummaries: string[];
}

export interface ProgressSummary {
  userId: string;
  dateRange: { start: string; end: string };
  totalWorkouts: number;
  averageFormQuality: number;
  mobilityProgressionTrend: 'Improving' | 'Stagnant' | 'Declining';
  latestAssessment?: OverallAssessment;
}

export const generateProgressReport = (reports: WorkoutReport[]): ProgressSummary => {
  // Logic to aggregate workout reports into a summary
  return {
    userId: 'anonymous',
    dateRange: { start: '', end: '' },
    totalWorkouts: reports.length,
    averageFormQuality: 0,
    mobilityProgressionTrend: 'Stagnant'
  };
};
