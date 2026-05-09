# Phase 8 Subtitles & Captions Report

## Overview
Successfully introduced lightweight, browser-native AI caption overlays directly integrated into the playback visualization and export canvas rendering loop without adding bloated transcription dependencies or causing stutter during animations.

## Implementation Details

### 1. Zero-Backend Approximation Timing
- Subtitles operate using a fast, deterministic textual slicer that maps natively against the `aiScript` array.
- The system divides large AI narration blocks into smaller readable chunks (~4 to ~7 words max, splitting naturally on punctuation limits).
- Subtitle timings are computed dynamically, measuring the fractional length of a chunk’s word-count against the entire line’s length, projected proportionally over the designated `duration` of the clip in the timeline.

### 2. Live Preview Overlay
- Deployed an `AnimatePresence` driven React overlay anchored natively above the `StretchAnimationPlayer`.
- Subtitle visibility reacts securely alongside standard React state flows natively tracking `activeItemIndex` and `currentTime` to drop perfectly timed sub-layers without blocking the global execution thread.

### 3. Integrated Canvas Exporter
- Linked the `studioStateRef` directly to `isRecording` exports, injecting the exact chunk logic seamlessly inside `requestAnimationFrame`.
- When writing WebM chunks, captions are painted manually (`fillText` and `roundRect` backgrounds using `ctx.measureText` metrics) cleanly scaling to 90px on 16:9 canvas dimensions and supporting configurable formatting hooks (`top` / `bottom` tracking logic).

### 4. Configuration Controls & Persistence
- Deployed lightweight `Top Bar` dropdowns tracking User Intent choices (`Subtitles Enabled`, sizing, and location).
- Linked correctly to the `AUTOSAVE_KEY` JSON serialized persistence block so returning users never lose access to their rendering preferences.

## Scaling Thresholds
The current proportional timing engine expects fairly average speech pacing. Because it uses fraction lengths rather than strict phoneme acoustic boundary models, very slow narrations mixed with fast segments might display mild visual drifting inside extremely long clips (>60 seconds). 
**Safest Future Upgrade:** The next evolutionary tier involves implementing precise millisecond character-timestamp datasets directly from a speech-generation cloud platform (e.g. AWS Polly Speech Marks or Google Cloud TTS Timepoints), matching exact speech slices into a separate timeline mapping array.
