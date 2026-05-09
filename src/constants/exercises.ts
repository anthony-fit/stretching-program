export interface ExerciseData {
  name: string;
  youtubeVideoId: string;
  backupVideoIds: string[];
  description: string;
  targetArea: string;
  safetyTip: string;
  youtubeQuery: string;
}

export const VERIFIED_EXERCISES: Record<string, ExerciseData> = {
  'Child\'s Pose': {
    name: 'Child\'s Pose',
    youtubeVideoId: '2_SE2g17ypU',
    backupVideoIds: ['eqVMAPM0_0'],
    description: `This guide focuses on the best way to perform the Child's Pose stretch for beginners.

### How to Do the Child's Pose Stretch
A calming restorative pose that stretches the hips, thighs, and ankles while reducing stress. Maintain a comfortable position and focus on the area around your hips & back. Remember to prioritize your safety: Rest your forehead on the mat and breathe into your back.

### Breathing Technique
Inhale deeply before starting the stretch, and exhale slowly as you lean into it. Keep a steady, rhythmic breath to help relax your muscles and increase your range of motion.

### Benefits of the Child's Pose Stretch
*   Improves flexibility in the spine and hips
*   Reduces muscle tightness in the lower back
*   Supports active recovery and stress reduction`,
    targetArea: 'Hips & Back',
    safetyTip: 'Rest your forehead on the mat and breathe into your back.',
    youtubeQuery: 'Child\'s Pose Yoga With Adriene'
  },
  'Cat-Cow': {
    name: 'Cat-Cow Stretch',
    youtubeVideoId: 'wO6u999ba98',
    backupVideoIds: ['7pZ_XBy-8_8'],
    description: `A gentle flow between two poses that warms up the spine and relieves tension in the back and neck.

### The Protocol
Move between ARCHED and ROUNDED back positions, synchronizing with your breath. This movement pattern re-hydrates spinal discs and resets postural alignment.

### Breathing Matrix
*   **Inhale (Cow):** Drop the belly, look up slightly.
*   **Exhale (Cat):** Round the spine, tuck the chin.

### Key Benefits
*   Increased spinal mobility
*   Neck and shoulder tension release
*   Improved core awareness`,
    targetArea: 'Spine & Back',
    safetyTip: 'Move slowly and breathe deeply with each movement.',
    youtubeQuery: 'Cat Cow Stretch Yoga With Adriene'
  },
  'Downward Dog': {
    name: 'Downward Facing Dog',
    youtubeVideoId: 'j97SSGzqhxg',
    backupVideoIds: ['EC7RGJ9w_0'],
    description: `A foundational pose that stretches the hamstrings, calves, and shoulders while strengthening the arms.

### Execution Guide
Form an inverted 'V' shape with your body. Press firmly through your palms and reach your sit bones toward the ceiling. Great for full-body integration.

### Focus Points
*   **Shoulders:** Push away from the floor.
*   **Heels:** Reach toward the mat (don't worry if they don't touch).
*   **Core:** Pull the navel in toward the spine.`,
    targetArea: 'Full Body',
    safetyTip: 'Keep your knees slightly bent if your hamstrings are tight.',
    youtubeQuery: 'Downward Dog Yoga With Adriene'
  },
  'Cobra Stretch': {
    name: 'Cobra Stretch',
    youtubeVideoId: 'fOdrW7nfPrg',
    backupVideoIds: ['3vI_7v_8_8'],
    description: 'Opens the chest and stretches the abdominal muscles while strengthening the spine.',
    targetArea: 'Chest & Core',
    safetyTip: 'Keep your shoulders away from your ears.',
    youtubeQuery: 'Cobra Pose Yoga With Adriene'
  },
  'Pigeon Pose': {
    name: 'Pigeon Pose',
    youtubeVideoId: 'n_7u2G89e-o',
    backupVideoIds: ['5vI_7v_8_8'],
    description: `A deep hip opener that targets the glutes and psoas muscles.

### Setup Protocol
Bring one knee forward and place it behind your wrist. Extend the other leg straight back. Keep your hips square to the front.

### Key Focus
*   **Hips:** Allow them to sink deeper with every exhale.
*   **Torso:** Stay upright or fold forward for a deeper stretch.
*   **Breath:** Controlled, deep nasal breathing.`,
    targetArea: 'Hips & Glutes',
    safetyTip: 'Keep your front foot flexed to protect your knee.',
    youtubeQuery: 'Pigeon Pose Yoga With Adriene'
  },
  'Hamstring Stretch': {
    name: 'Hamstring Stretch',
    youtubeVideoId: 'L_xrDAtykMI',
    backupVideoIds: ['7vI_7v_8_8'],
    description: `Targets the back of the legs to improve flexibility and reduce lower back pain.

### Optimal form
Keep your back flat as you hinge at the hips. Leading with your chest ensures the stretch remains in the hamstrings rather than rounding the spine.

### Benefits
*   Increased leg mobility
*   Lumbar tension relief
*   Improved posture`,
    targetArea: 'Hamstrings',
    safetyTip: 'Do not bounce; hold the stretch steadily.',
    youtubeQuery: 'Hamstring Stretch Yoga With Adriene'
  },
  'Neck Stretch': {
    name: 'Gentle Neck Release',
    youtubeVideoId: 'X3-gK_s--n8',
    backupVideoIds: ['9vI_7v_8_8'],
    description: `Relieves tension in the upper traps and neck muscles from sitting or stress.

### The Release
Tilt your head gently to the side, allowing gravity to create space in the neck. Do not pull with force.

### Protocol Details
*   **Intensity:** 3/10 (Keep it gentle).
*   **Focus:** Release the jaw and relax the shoulders.
*   **Duration:** 30-45 seconds per side.`,
    targetArea: 'Neck & Shoulders',
    safetyTip: 'Never force the movement; let gravity do the work.',
    youtubeQuery: 'Neck Stretch Yoga With Adriene'
  },
  'Forward Fold': {
    name: 'Standing Forward Fold',
    youtubeVideoId: 'g7Uhp5tH2mU',
    backupVideoIds: ['ZTo2pKu1S8E'],
    description: `Stretches the entire back body from the heels to the neck.

### Full Body Integration
Let your upper body hang heavy. This inversion helps decompress the spine while deeply stretching the posterior chain.

### Tips
*   **Knees:** Micro-bend to protect the joints.
*   **Head:** Let it hang loose to release neck tension.`,
    targetArea: 'Full Body',
    safetyTip: 'Bend your knees as much as needed to touch the floor.',
    youtubeQuery: 'Forward Fold Yoga With Adriene'
  },
  'Butterfly Pose': {
    name: 'Butterfly Pose',
    youtubeVideoId: 'ZTo2pKu1S8E',
    backupVideoIds: ['Y_S07Y_8_8'],
    description: `Stretches the inner thighs, groins, and knees.

### Inner Core Work
Bring the soles of your feet together and let your knees fall open. Excellent for desk workers who sit for long periods.

### Benefits
*   Hip mobility improvement
*   Pelvic floor awareness
*   Stress reduction`,
    targetArea: 'Hips & Groin',
    safetyTip: 'Keep your spine long and avoid rounding your back.',
    youtubeQuery: 'Butterfly Pose Yoga With Adriene'
  },
  'Shoulder Stretch': {
    name: 'Cross-Body Shoulder Stretch',
    youtubeVideoId: 'v7AYKno_8_8',
    backupVideoIds: ['X3-gK_s--n8'],
    description: `A simple but effective stretch for the deltoids and upper back.

### Lateral Fiber Release
Pull your arm across your chest using the opposite hand. Keep your shoulders level and avoid twisting your torso.

### Key Points
*   **Shoulder Blade:** Keep it tucked down.
*   **Bicep:** Pull it close to the chest.`,
    targetArea: 'Shoulders',
    safetyTip: 'Keep your shoulder down and away from your chin.',
    youtubeQuery: 'Shoulder Stretch Yoga With Adriene'
  }
};

export const FOCUS_AREA_MAPPING: Record<string, string[]> = {
  'Full Body': ['Cat-Cow', 'Downward Dog', 'Forward Fold', 'Child\'s Pose', 'Hamstring Stretch', 'Shoulder Stretch'],
  'Lower Body': ['Hamstring Stretch', 'Pigeon Pose', 'Butterfly Pose', 'Downward Dog', 'Forward Fold'],
  'Upper Body': ['Neck Stretch', 'Shoulder Stretch', 'Cobra Stretch', 'Cat-Cow'],
  'Spine and Back': ['Cat-Cow', 'Child\'s Pose', 'Downward Dog', 'Cobra Stretch'],
  'Hips and Glutes': ['Pigeon Pose', 'Butterfly Pose', 'Child\'s Pose', 'Hamstring Stretch']
};
