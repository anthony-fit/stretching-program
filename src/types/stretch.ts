// Shared TypeScript interfaces for Stretch Routines

export interface StretchExercise {
  name: string;
  description: string;
  duration: string | number;
  targetArea: string;
  safetyTip?: string;
  youtubeVideoId?: string;
  backupVideoIds?: string[];
  youtubeQuery?: string;
  videoSource?: string;
  imageUrl?: string | null;
  slug?: string;
  order?: number;
  instruction?: string;
  breathing?: string;
  safety?: string;
}

export interface StretchRoutine {
  title: string;
  focusArea: string;
  level: string;
  duration: number;
  exercises: StretchExercise[];
  motivationalNote?: string;
}
