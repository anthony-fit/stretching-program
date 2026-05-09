export interface Exercise {
  id: string;
  name: string;
  category: string; // Movement category e.g., 'Stretching', 'Strength', 'Cardio'
  focus: string[]; // High-level areas e.g., 'Full Body', 'Core', 'Lower Body'
  level: string; // e.g. 'Beginner', 'Intermediate', 'Advanced'
  description: string;
  benefits?: string[];
  videoUrl: string; // Placeholder for high-end assets
  thumbnail: string;

  // Enriched WGER-compatible metadata
  targetMuscles?: string[]; // Specific muscles, e.g., 'Gluteus Maximus', 'Pectoralis Major'
  equipment?: string[]; // e.g., 'None', 'Dumbbell', 'Resistance Band', 'Mat'
  mobilityTags?: string[]; // e.g., 'Hips', 'Shoulders', 'Thoracic'
  isSafeForBeginners?: boolean;
  trainingStyle?: string[]; // e.g., 'Hypertrophy', 'Endurance', 'Flexibility'
  painPointsAddressed?: string[]; // e.g., 'Lower Back Pain', 'Tight Hips', 'Desk Posture'
}

export const EXERCISE_DATABASE: Exercise[] = [
  {
    id: 'neck-tilt-01',
    name: 'Seated Neck Isometric',
    category: 'Mobility',
    focus: ['Neck', 'Upper Back'],
    level: 'Beginner',
    description: 'Slowly tilt the head while maintaining resistance.',
    benefits: ['Relieves tension', 'Improves posture'],
    videoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Sternocleidomastoid', 'Upper Trapezius'],
    equipment: ['None'],
    mobilityTags: ['Neck', 'Cervical'],
    isSafeForBeginners: true,
    trainingStyle: ['Flexibility', 'Recovery'],
    painPointsAddressed: ['Neck Pain', 'Desk Posture']
  },
  {
    id: 'shoulder-roll-02',
    name: 'Scapular Glides',
    category: 'Mobility',
    focus: ['Shoulders', 'Upper Back'],
    level: 'Beginner',
    description: 'Controlled rotation of the shoulder blades.',
    benefits: ['Warms up joint', 'Reduces clicking'],
    videoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Rhomboids', 'Trapezius'],
    equipment: ['None'],
    mobilityTags: ['Shoulders', 'Thoracic'],
    isSafeForBeginners: true,
    trainingStyle: ['Mobility', 'Recovery'],
    painPointsAddressed: ['Rounded Shoulders', 'Upper Back Tension', 'Desk Posture']
  },
  {
    id: 'hip-flex-03',
    name: '90/90 Hip Flow',
    category: 'Mobility',
    focus: ['Hips', 'Low Back', 'Lower Body'],
    level: 'Intermediate',
    description: 'Seated transition between hip rotations.',
    benefits: ['Deep hip mobility', 'Pelvic tilt correction'],
    videoUrl: 'https://images.unsplash.com/photo-1552196564-972d46387254?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1552196564-972d46387254?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Gluteus Medius', 'Hip Flexors', 'Piriformis'],
    equipment: ['Mat'],
    mobilityTags: ['Hips', 'Pelvis'],
    isSafeForBeginners: false,
    trainingStyle: ['Mobility'],
    painPointsAddressed: ['Tight Hips', 'Lower Back Pain']
  },
  {
    id: 'wall-sit-04',
    name: 'Wall Angel',
    category: 'Mobility',
    focus: ['Posture', 'Pec Stretch', 'Upper Back'],
    level: 'Beginner',
    description: 'Slide arms up a wall while keeping spine flat.',
    benefits: ['Fixes rounded shoulders', 'Opens chest'],
    videoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Pectoralis Minor', 'Lower Trapezius', 'Rhomboids'],
    equipment: ['None'],
    mobilityTags: ['Thoracic', 'Shoulders'],
    isSafeForBeginners: true,
    trainingStyle: ['Mobility', 'Posture'],
    painPointsAddressed: ['Desk Posture', 'Rounded Shoulders', 'Shoulder Impingement']
  },
  {
    id: 'cobra-05',
    name: 'Modified Cobra',
    category: 'Stretching',
    focus: ['Abdominals', 'Back', 'Core'],
    level: 'Beginner',
    description: 'Gently push up while keeping hips on floor.',
    benefits: ['Back flexibility', 'Abdominal stretch'],
    videoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Rectus Abdominis', 'Erector Spinae'],
    equipment: ['Mat'],
    mobilityTags: ['Lumbar Screen', 'Spine'],
    isSafeForBeginners: true,
    trainingStyle: ['Flexibility'],
    painPointsAddressed: ['Lower Back Pain', 'Stiff Spine']
  },
  {
    id: 'quad-06',
    name: 'Standing Quad Stretch',
    category: 'Stretching',
    focus: ['Quads', 'Balance', 'Lower Body'],
    level: 'Beginner',
    description: 'Hold one foot behind you while standing on other leg.',
    benefits: ['Stretches front of leg', 'Improves balance'],
    videoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Quadriceps Femoris'],
    equipment: ['None'],
    mobilityTags: ['Knees', 'Hips'],
    isSafeForBeginners: true,
    trainingStyle: ['Flexibility'],
    painPointsAddressed: ['Knee Pain', 'Tight Quads']
  },
  {
    id: 'squat-07',
    name: 'Bodyweight Squat',
    category: 'Strength',
    focus: ['Lower Body'],
    level: 'Beginner',
    description: 'Lower your hips keeping your back straight.',
    benefits: ['Builds leg strength', 'Improves hip mobility'],
    videoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: ['None'],
    mobilityTags: ['Hips', 'Ankles'],
    isSafeForBeginners: true,
    trainingStyle: ['Strength'],
    painPointsAddressed: ['Weak Legs', 'Poor Hip Mobility']
  },
  {
    id: 'pushup-08',
    name: 'Push Up',
    category: 'Strength',
    focus: ['Upper Body', 'Core'],
    level: 'Intermediate',
    description: 'Lower your body to the floor and push back up.',
    benefits: ['Builds chest and tricep strength', 'Improves core stability'],
    videoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Pectoralis Major', 'Triceps Brachii', 'Anterior Deltoid'],
    equipment: ['None'],
    mobilityTags: ['Shoulders', 'Wrists'],
    isSafeForBeginners: false,
    trainingStyle: ['Strength'],
    painPointsAddressed: ['Weak Upper Body']
  },
  {
    id: 'jumping-jacks-09',
    name: 'Jumping Jacks',
    category: 'Cardio',
    focus: ['Full Body'],
    level: 'Beginner',
    description: 'Jump while spreading arms and legs.',
    benefits: ['Raises heart rate', 'Full body warm up'],
    videoUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Calves', 'Shoulders', 'Core'],
    equipment: ['None'],
    mobilityTags: [],
    isSafeForBeginners: true,
    trainingStyle: ['Cardio', 'Endurance'],
    painPointsAddressed: ['Lethargy', 'Low Stamina']
  },
  {
    id: 'bird-dog-10',
    name: 'Bird Dog',
    category: 'Functional',
    focus: ['Core', 'Back'],
    level: 'Beginner',
    description: 'On all fours, extend opposite arm and leg.',
    benefits: ['Core stability', 'Spinal alignment'],
    videoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop',
    targetMuscles: ['Erector Spinae', 'Glutes', 'Rectus Abdominis'],
    equipment: ['Mat'],
    mobilityTags: ['Spine', 'Hips'],
    isSafeForBeginners: true,
    trainingStyle: ['Functional', 'Core'],
    painPointsAddressed: ['Lower Back Pain', 'Core Weakness']
  }
];
