import { findBestMatch } from './src/utils/matchExercise';
import { videoDatabase } from './src/constants/videoDatabase';

console.log("Cat-Cow Stretch =>", findBestMatch("Cat-Cow Stretch", videoDatabase));
console.log("Cross-Body Shoulder Stretch =>", findBestMatch("Cross-Body Shoulder Stretch", videoDatabase));
console.log("Downward Facing Dog =>", findBestMatch("Downward Facing Dog", videoDatabase));
console.log("Cat Cow =>", findBestMatch("Cat Cow", videoDatabase));
console.log("Glute Bridge =>", findBestMatch("Glute Bridge", videoDatabase));
