# Scene Transition & Continuity Polish Report

## Exact Files Changed
- `/src/pages/VideoStudioPage.tsx`

## Transition Strategy Used
1. **DOM Crossfade Layering**: Replaced the harsh solid-white flash transition overlay with concurrent component rendering using `<AnimatePresence initial={false}>`. When scenes switch, the old `StretchAnimationPlayer` instance remains in the DOM while its `opacity` drops, allowing the new scene's player to fade in over the top of it.
2. **Export Parity Architecture**: The `.webm` rendering engine (`renderLoop` driven by `requestAnimationFrame`) was refactored into a declarative `drawScene` helper. During the specified transition window (`0`, `0.4s`, or `0.8s`), the exporter now executes `drawScene` *twice* per frame: once for the previous item fading out (`1 - fadeProgress`) and once for the active item fading in (`fadeProgress`), exactly matching the DOM motion.
3. **Subtitle Motion Alignment**: Added sub-scene independent fading logic to the export canvas layer. Now, as subtitles pop in and out within a *single* scene, they compute an isolated `subAlpha` and `animY` sliding offset, perfectly imitating `framer-motion`'s DOM ease-out entrance without heavy libraries.

## Performance Impact
- **Minimal memory footprint**: We maintain only up to two DOM `<StretchAnimationPlayer>` nodes at a time (during transitions).
- **Fast 2D Contexting**: Using `ctx.globalAlpha` in the export loop incurs near-zero GPU cost compared to bringing in a WebGL-based or robust compositing engine like WebCodecs/ffmpeg.
- Playback responsiveness remains perfectly synced because the same `storyboard.duration` division math is used for both subtitle bounding and drawing.

## Remaining Limitations
- **No Complex Easings**: The canvas export linearizes its opacity fades (`fadeProgress`) instead of utilizing bezier curve math. They are simple cuts and soft blends.
- **Audio Hard Cuts**: The transition engine currently ignores `audioRef` tracks. If an exercise uses Voiceover, the audio still cleanly halts at the boundary rather than cross-fading volume levels.

## Safest Future Upgrade Path
To advance beyond simple opacity crossfades (e.g. directional wipes, blur-fades, luma mattes), the architecture must stop relying on the native Canvas 2D API (`drawImage`). 
The safest upgrade path would be utilizing the **Remotion Webpack Player**, which handles frame-accurate asynchronous sequencing and allows us to use pure React structures (like CSS Masks and SVG filters) for transitions that are guaranteed to translate exactly to `.mp4`/`.webm` without writing custom `globalAlpha` rendering loops.
