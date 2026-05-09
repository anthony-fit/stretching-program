# Phase 3 Safe Precision Investigation Report

## 1. Current Export Timing Model Analysis
The current architecture relies on two decoupled clocks:
*   **Logical Clock (`setInterval`)**: Ticks once per second (1000ms), incrementing the global React `currentTime` state, checking `effectiveSceneDuration`, and triggering scene transitions.
*   **Visual/Export Clock (`requestAnimationFrame`)**: Fires at the display refresh rate (e.g., 60fps), reading from a synchronized `studioStateRef` to draw visuals onto the hidden export canvas, which is captured by `canvas.captureStream()` into `MediaRecorder`.

**Vulnerabilities & Drift Vectors:**
*   **Throttle Drift:** Backgrounded or heavy-load browser tabs will throttle `setInterval`, causing scene times to stretch artificially, freezing `MediaRecorder` exports.
*   **Granularity Drift:** Because time steps are integer-based (+1 sec), scene switches can misalign with audio termination by up to ~999ms, causing premature cuts or lingering silence.
*   **Visual-Audio Desync:** `captureStream()` emits real-time visual frames. If the React component lags updating `currentTime`, the video exports visual freezing while the audio track (driven strictly by Web Audio API / `HTMLAudioElement`) continues flawlessly.

## 2. Deterministic Rendering Feasibility
Converting to true deterministic offline rendering (where each frame specifies its own timestamp e.g. `frame(t = 0.33s)`) is **IMPOSSIBLE** while retaining `MediaRecorder`.
`MediaRecorder` dictates that frames supplied via `captureStream` align flawlessly with *wall-clock real-time*. To avoid a massive architecture rewrite (e.g., stripping out `MediaRecorder`), we must stabilize the *real-time generation precision* rather than switching to an offline renderer.

We **can** decouple export time safely by creating a high-precision local clock.

## 3. The Safest Upgrade Path Comparison
*   **A) requestAnimationFrame + delta accumulation (WINNER)**: Replaces the `setInterval` globally. A shared `requestAnimationFrame` calculates precise sub-frame time elapsed (`dt = current - lastRun`) via `performance.now()`. Updates UI & triggers scene cuts with millisecond precision natively bound to the visual frame loop.
*   **B) Fixed Timestep Simulation**: Complex, risks dropping audio sync if visuals lag significantly.
*   **C) Frame-Index Deterministic Stepping**: Requires total rewrite. Compatible only with WebCodecs.
*   **D) AudioContext.currentTime Driven Rendering**: Highly precise, but fails if silent exports are generated or audio fetching pauses.
*   **E) WebCodecs Future Migration**: Massive engineering effort. Adds complexity to an otherwise lightweight tool.

## 4. Phase 3 Minimum Viable Implementation Strategy
**Strategy: Global High-Precision RAF Clock Integration**

To preserve current UI, components, and MediaRecorder functionality, Phase 3 should:
1.  **Remove `setInterval`** from `VideoStudioPage.tsx`.
2.  **Introduce a global `requestAnimationFrame` loop** responsible for BOTH state logic and `exportCanvas` rendering.
3.  **Track Time as a Float (`dt`)**: `currentTime` becomes a high-precision fractional value (e.g., `4.321` seconds).
4.  **Audio Sync**: `effectiveDuration` calculation remains safely intact. Scene switches happen exactly when `currentTime >= effectiveDuration`, reducing lag constraints.

## 5. What Should NOT Change
*   **MediaRecorder / captureStream Pipeline**: This pipeline successfully yields standard MP4/WebM without any server cost.
*   **Web Audio API Mixing**: Continue using `createMediaStreamDestination()` merging.
*   **UI Hierarchy**: Keep timeline tracking proportional; UI seamlessly adapts to fractional seconds vs integer seconds.
*   **Image Cache/DOM Structure**: Rely on standard `Image` preloading.

## 6. Estimated Gains & Remaining Risks
**Expected Performance Gains**:
*   Vastly smoother progress bar updates (60fps vs 1fps UI).
*   Elimination of JS-engine garbage-collection stuttering breaking scene limits.

**Expected Sync Accuracy Gains**:
*   Sub-frame scene switching (~16ms accuracy compared to ~1000ms accuracy).
*   Guarantees audio never gets prematurely chopped by strict interval overlapping.

**Risks Still Remaining**:
*   **Browser Tab Throttling**: Users must remain on the active tab while exporting, or `rAF` will pause, potentially breaking output.
*   **Variable Refresh Rates**: `captureStream(30)` capturing from a 120hz or 144hz display can drop frames irregularly.

**When WebCodecs Becomes Justified**:
WebCodecs is ONLY justified if users demand **Background Tab Exports** (exporting safely after minimizing the window) or **Higher-Than-Realtime Processing** (e.g., exporting a 5-minute video in 10 seconds). As long as real-time foreground exports are acceptable, the RAF+MediaRecorder hybrid remains the best, lightest solution.
