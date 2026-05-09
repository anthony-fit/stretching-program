export interface AssessmentMetrics {
  romScores: Record<string, number>; // Range of motion e.g. { 'Shoulder Flexion': 85 }
  stabilityScores: Record<string, number>;
  painIndicators: Record<string, boolean>;
}

export interface MobilityBaseline {
  id: string;
  userId: string;
  date: string;
  metrics: AssessmentMetrics;
  overallScore: number;
  recommendations: string[];
}

export interface GLP1MuscleGuardAssessment {
  id: string;
  userId: string;
  date: string;
  muscleMassPreservationScore: number;
  sarcopeniaRiskLevel: 'Low' | 'Medium' | 'High';
  proteinIntakeAdherence: number;
  recommendedHypertrophyVolume: number;
}

export interface MovementAssessment {
  id: string;
  type: string; // e.g. 'Squat', 'Hinge', 'Push'
  score: number;
  compensationsIdentified: string[]; // e.g. 'Knee Valgus', 'Spinal Flexion'
  videoUrl?: string;
  feedback: string;
}

export interface OverallAssessment {
  id: string;
  userId: string;
  date: string;
  mobilityBaseline: MobilityBaseline;
  glp1Guard?: GLP1MuscleGuardAssessment;
  movementAssessments: MovementAssessment[];
}

export interface LearningTutorial {
  id: string;
  title: string;
  type: 'Video' | 'Interactive';
  content: string;
  keyTakeaways: string[];
}

export interface LearningPractice {
  id: string;
  tutorialId: string;
  completed: boolean;
  score: number;
}

// Stubs for future implementation
export const getLatestOverallAssessment = async (userId: string): Promise<OverallAssessment | null> => {
  return null; // Not implemented yet
}

export const submitMovementAssessment = async (assessment: MovementAssessment): Promise<void> => {
  console.log("Submitting movement assessment", assessment);
}
