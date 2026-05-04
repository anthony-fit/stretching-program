import { StretchRoutine, StretchExercise } from './geminiService';
import { VERIFIED_EXERCISES, FOCUS_AREA_MAPPING } from '../constants/exercises';
import { getVideoUrl } from './videoService';
import { videoDatabase } from '../constants/videoDatabase';
import { buildInstruction, buildBreathing } from '../utils/instructionBuilder';
import { slugify } from '../utils/slugify';

export function generateLocalRoutine(
  level: string,
  focusArea: string,
  duration: number,
  wgerExercises: any[] = []
): StretchRoutine {
  // 1. Determine which exercises to include based on focus area
  const baseKeys = FOCUS_AREA_MAPPING[focusArea] || FOCUS_AREA_MAPPING['Full Body'];
  
  // 1.5 SMART LOGIC: Curate and prioritize exercises based on Fitness Level
  let curatedKeys = [...baseKeys];
  
  if (level === 'Beginner') {
    // Beginners: prioritize foundational, gentle poses first
    const beginnerFriendly = ['Cat-Cow', 'Child\'s Pose', 'Neck Stretch', 'Butterfly Pose', 'Shoulder Stretch'];
    curatedKeys.sort((a, b) => {
      const aScore = beginnerFriendly.includes(a) ? 1 : 0;
      const bScore = beginnerFriendly.includes(b) ? 1 : 0;
      return bScore - aScore; // higher score first
    });
  } else if (level === 'Advanced') {
    // Advanced: prioritize deeper, compound stretches first
    const advancedFocus = ['Pigeon Pose', 'Downward Dog', 'Forward Fold', 'Hamstring Stretch', 'Cobra Stretch'];
    curatedKeys.sort((a, b) => {
      const aScore = advancedFocus.includes(a) ? 1 : 0;
      const bScore = advancedFocus.includes(b) ? 1 : 0;
      return bScore - aScore; // higher score first
    });
  }
  // Intermediate keeps the balanced default order
  
  // 2. Map keys to full exercise objects
  let exercises: StretchExercise[] = curatedKeys.map(key => {
    const base = VERIFIED_EXERCISES[key];
    
    // Check if we have an exact matching wger exercise
    const wgerMatch = wgerExercises.find(w => {
      if (!w?.name) return false;
      return w.name.toLowerCase().trim() === base.name.toLowerCase().trim();
    });

    return {
      ...base,
      duration: '1-2 Minutes',
      videoSource: wgerMatch ? 'wger.de' : 'Local System',
      imageUrl: wgerMatch && wgerMatch.imageUrl ? wgerMatch.imageUrl : null
    };
  });

  // Strict wger validation
  let validated = exercises.filter(ex => {
    const existsInWger = wgerExercises.some(w => 
      w.name.toLowerCase().trim() === ex.name.toLowerCase().trim()
    );
    console.log("Clinical Validation:", { name: ex.name, existsInWger });
    return existsInWger;
  });

  // Syc with video layer
  validated = validated.filter(ex => {
    const video = getVideoUrl(ex.name);
    console.log("Video Check:", { name: ex.name, hasVideo: !!video });
    return !!video;
  });

  if (validated.length < 3) {
    // Fallback using ONLY wgerExercises that have video
    const wgerWithVideo = wgerExercises.filter(w => !!getVideoUrl(w.name));
    
    const fallbacks = wgerWithVideo.slice(0, 5).map(w => {
      // Find matching in verified
      for (const vKey of Object.keys(VERIFIED_EXERCISES)) {
        if (VERIFIED_EXERCISES[vKey].name.toLowerCase() === w.name.toLowerCase()) {
           return { ...VERIFIED_EXERCISES[vKey], duration: '1 Minute', videoSource: 'wger.de', imageUrl: w.imageUrl || null };
        }
      }
      return {
        name: w.name,
        description: `Perform the ${w.name} stretch carefully holding for the specified duration.`,
        duration: '1 Minute',
        targetArea: focusArea,
        safetyTip: 'Breathe deeply and do not bounce.',
        youtubeVideoId: '',
        backupVideoIds: [],
        youtubeQuery: w.name + ' stretch',
        videoSource: 'wger.de',
        imageUrl: w.imageUrl || null
      };
    });
    
    // Only add fallbacks that aren't already in validated
    fallbacks.forEach(f => {
      if (!validated.some(v => v.name.toLowerCase() === f.name.toLowerCase())) {
        validated.push(f);
      }
    });
  }

  // 3. SMART LOGIC: Adjust number of exercises based on Level and Duration
  // Beginners get fewer stretches (more time per stretch to learn form)
  // Advanced get more stretches (quicker transitions, higher density)
  let targetCount;
  if (level === 'Beginner') {
    targetCount = Math.max(3, Math.min(validated.length, Math.floor(duration / 2.5)));
  } else if (level === 'Advanced') {
    targetCount = Math.max(5, Math.min(validated.length, Math.ceil(duration / 1.5)));
  } else {
    // Intermediate
    targetCount = Math.max(4, Math.min(validated.length, Math.ceil(duration / 2)));
  }
  
  let finalExercises = validated.slice(0, targetCount);

  // --- STABILIZATION LOGIC (Step 8) ---
  
  // 1. Distribution Logic: Ensure representative muscle groups
  const groups = {
    upper: ["shoulder", "neck", "arm", "wrist", "chest", "trapezius", "deltoid"],
    core: ["spine", "back", "twist", "abs", "oblique", "cat-cow", "cobra"],
    lower: ["leg", "hamstring", "hip", "calf", "glute", "quad", "pigeon", "butterfly", "psoas", "flexor"]
  };

  const hasUpper = finalExercises.some(ex => groups.upper.some(k => ex.name.toLowerCase().includes(k)));
  const hasCore = finalExercises.some(ex => groups.core.some(k => ex.name.toLowerCase().includes(k)));
  const hasLower = finalExercises.some(ex => groups.lower.some(k => ex.name.toLowerCase().includes(k)));

  const fillFromWger = (keywordList: string[], count: number) => {
    const candidates = wgerExercises
      .filter(w => !finalExercises.some(e => e.name.toLowerCase() === w.name.toLowerCase()))
      .filter(w => keywordList.some(k => w.name.toLowerCase().includes(k)))
      .filter(w => !!getVideoUrl(w.name))
      .slice(0, count);

    return candidates.map(w => {
      // Try to find in verified first
      for (const vKey of Object.keys(VERIFIED_EXERCISES)) {
        if (VERIFIED_EXERCISES[vKey].name.toLowerCase() === w.name.toLowerCase()) {
          return { ...VERIFIED_EXERCISES[vKey], duration: '1 Minute', videoSource: 'wger.de', imageUrl: w.imageUrl || null };
        }
      }
      return {
        name: w.name,
        description: `Perform the ${w.name} stretch carefully holding for the specified duration.`,
        duration: '1 Minute',
        targetArea: focusArea,
        safetyTip: 'Breathe deeply and do not bounce.',
        youtubeVideoId: '',
        backupVideoIds: [],
        youtubeQuery: w.name + ' stretch',
        videoSource: 'wger.de',
        imageUrl: w.imageUrl || null
      };
    });
  };

  if (!hasUpper && focusArea === 'Full Body') finalExercises = [...finalExercises, ...fillFromWger(groups.upper, 1)];
  if (!hasCore && focusArea === 'Full Body') finalExercises = [...finalExercises, ...fillFromWger(groups.core, 1)];
  if (!hasLower && focusArea === 'Full Body') finalExercises = [...finalExercises, ...fillFromWger(groups.lower, 1)];

  // 2. Minimum Routine Size: Ensure at least 5 exercises
  if (finalExercises.length < 5) {
    const needed = 5 - finalExercises.length;
    const additional = wgerExercises
      .filter(w => !finalExercises.some(e => e.name.toLowerCase() === w.name.toLowerCase()))
      .filter(w => !!getVideoUrl(w.name))
      .slice(0, needed)
      .map(w => {
        for (const vKey of Object.keys(VERIFIED_EXERCISES)) {
          if (VERIFIED_EXERCISES[vKey].name.toLowerCase() === w.name.toLowerCase()) {
            return { ...VERIFIED_EXERCISES[vKey], duration: '1 Minute', videoSource: 'wger.de', imageUrl: w.imageUrl || null };
          }
        }
        return {
          name: w.name,
          description: `Focus on the form for ${w.name} to maximize mobility.`,
          duration: '1 Minute',
          targetArea: focusArea,
          safetyTip: 'Maintain steady breathing.',
          youtubeVideoId: '',
          backupVideoIds: [],
          youtubeQuery: w.name + ' stretch',
          videoSource: 'wger.de',
          imageUrl: w.imageUrl || null
        };
      });
    finalExercises = [...finalExercises, ...additional];
  }

  // 3. Prevent Duplicates
  const unique = [];
  const seen = new Set();
  for (const ex of finalExercises) {
    const cleanName = ex.name.toLowerCase().trim();
    if (!seen.has(cleanName)) {
      seen.add(cleanName);
      unique.push(ex);
    }
  }

  // 4. Debug Logs
  console.log("FINAL ROUTINE:", unique.map(e => e.name));

  // 5. Timing Engine Logic (Step 9)
  const totalExercises = unique.length;
  const totalSeconds = duration * 60;
  const baseTime = Math.floor(totalSeconds / totalExercises);

  const timedRoutine = unique.map((ex, index) => {
    return {
      ...ex,
      slug: slugify(ex.name),
      duration: baseTime,
      order: index + 1,
      instruction: buildInstruction(ex.name),
      breathing: buildBreathing(),
      safety: "Stop if you feel pain. Stretch should not be painful."
    };
  });

  // Add Warmup + Cooldown Adjustment
  if (timedRoutine.length > 0) {
    timedRoutine[0].duration = (timedRoutine[0].duration as number) + 10;
    if (timedRoutine.length > 1) {
      timedRoutine[timedRoutine.length - 1].duration = (timedRoutine[timedRoutine.length - 1].duration as number) + 10;
    }
  }

  // Ensure Total Time Consistency
  const assigned = timedRoutine.reduce((sum, ex) => sum + (ex.duration as number), 0);
  const diff = totalSeconds - assigned;

  if (diff !== 0 && timedRoutine.length > 0) {
    timedRoutine[0].duration = (timedRoutine[0].duration as number) + diff;
  }

  console.log("TIMED ROUTINE:", timedRoutine.map(e => ({ name: e.name, dur: e.duration })));

  return {
    title: `${level} ${focusArea} Protocol`,
    focusArea,
    level,
    duration,
    exercises: timedRoutine,
    motivationalNote: `This protocol was uniquely curated for your ${level.toLowerCase()} level focusing on ${focusArea}. Move mindfully and enjoy the process.`
  };
}
