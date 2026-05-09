# Phase 3 Hardening Report

## Overview
Successfully improved export resilience and asset preloading reliability without introducing `WebCodecs`, `ffmpeg.wasm`, or rewriting the underlying rendering timing models.

## Detailed Improvements

### 1. Robust Asset Preloading
- Export is now deferred until both `storyboard` images (thumbnails) and `aiScript` audio URLs are explicitly preloaded using strict Web API object caches (`HTMLImageElement` and `HTMLAudioElement`).
- Preloading correctly implements CORS attributes so `getImageData(...)` limitations aren't raised downstream inside the `2DContext`.
- Introduced `Promise.all` waiting mechanisms paired with fallback timeouts/error handlings. If an asset fails to fetch, it is still bypassed gracefully instead of locking the export sequence completely.

### 2. State-Machine Driven UX
Introduced an `exportState` strict type-bound state variable (`"idle" | "preloading" | "recording" | "finalizing" | "completed" | "failed"`). 
- Integrated these states into the user UI (replacing previously complex ternary evaluations to an explicit lookup map style evaluation) to ensure users see explicit loader icons along with explicit button text strings: `"PRELOADING..."`, `"FINALIZING..."`, `"STOP"`, `"DONE"`.

### 3. Comprehensive Cancellation & Teardown 
By evaluating states early in `toggleRecording`:
- Unbound intervals (`requestAnimationFrame`) are manually cleared and ref nulled.
- Hanging background audio buffers are forced explicitly into `.pause()` and returned to `currentTime = 0`.
- The `isRecording` flag is cleanly managed so users can trigger stops and seamlessly restart without accumulating previous session data (e.g. `recordedChunksRef` wiping).

### 4. Memory Optimization
- Reusing single `AudioContext` bindings correctly isolated to `if (!audioContextRef.current) {...}` setup preventing memory leaks on repetitive runs.

## Remaining Vulnerabilities
- Memory allocation constraint limits (RAM limitations) will remain depending on device strength on very large ~15min+ exports due to the Blobs amassing locally.
- Inactive tabs throttling.

## WebCodecs Integration Future Threshold
With preloading and synchronization implemented securely alongside RAF, WebCodecs is officially **only** theoretically beneficial if actual "Offline Unbound Rendering" is required (i.e., exporting background tabs, or 10x-speed exporting instead of active 1:1 real-time canvas captures). Currently, performance is completely production-ready.
