# Framing & Safe Area Audit Report

## Exact Files Changed
- `/src/components/StretchAnimationPlayer.tsx`
- `/src/pages/VideoStudioPage.tsx`

## Framing Strategy Used
1. **Adaptive Mode Abstraction**: Abstracted the raw scaling logic in `StretchAnimationPlayer` into a computed `framing` object powered by a `framingMode` prop (`"fit" | "focus" | "cinematic"`).
2. **Safe Mode Definitions**:
   - `fit`: Uses `scale: 0.95` with heavy padding to guarantee absolute visibility of limbs, preventing bounding boxes from hitting the canvas edges.
   - `focus`: Applies a stable `scale: 1.05` to create a tighter, more engaging crop while retaining solid visibility of upper body and posture.
   - `cinematic`: Retains the dramatic 8-second panning style (`scale: 1.05 -> 1.15`, `y: 5 -> -5`).
3. **Export Engine Sync (CRITICAL)**: Previously, the `.webm` exporter purely copied `cW` / `cH` aspect ratios blindly. Now, the `renderLoop()` recalculates the specific `exportScale` and `yOffset` dynamically based on the current `framingMode`. For the `cinematic` mode, it mathematically replicates the CSS ping-pong keyframe using `(state.currentTime % 16) / 8` to perfectly synchronize the exported frame rendering with the live preview drift.

## Biggest Visual Improvements
- Subtitles and titles no longer overlap subjects with aggressive 1:1 image ratios, since the user can switch to "Fit".
- "Focus" mode eliminates jarring cinematic wobble on highly-technical exercise illustrations without leaving huge dead space.
- The `.webm` export will finally match the dramatic scale/pan seen in the live preview window without needing a heavy rendering engine.

## Remaining Limitations Before Advanced Subject-Aware Framing
- **Static Math over Semantic Cropping**: The scaling is purely mathematical (`* 1.05`). It doesn't know *what* is in the image. If an exercise illustration has the subject offset heavily to the left, "Focus" mode might still clip their hand.
- **Dynamic Asymmetry**: The panning in "Cinematic" mode just moves vertically. Real dynamic framing would identify points of interest and pan horizontally across the stretch.

## Safest Future Upgrade Path
To implement actual intelligent motion cropping without massive client-side GPU usage or frame-thrashing:
1. Do **not** run real-time pose detection models (like MediaPipe) in the `renderLoop`, as `.webm` chunks require 10+ frames per second and CPU encoding maxes out easily.
2. Best approach: Perform bounding box inference *once* on the server (or locally at mount) when the exercise image is loaded, returning `{ "subjectBoundingBox": [x, y, w, h] }`.
3. Use those cached bounds to dynamically calculate the `transform-origin` for the `motion.div` scaling or the X/Y pivots in `ctx.drawImage`. This provides perfect subject-tracking without a per-frame processing cost.
