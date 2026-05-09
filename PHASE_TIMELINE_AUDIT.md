# Phase: Timeline Temporal Audit

## 1. Authoritative Timing Chain
The current orchestration architecture relies on a fragmented timing chain across three distinct layers:

| Layer | Driving Mechanism | Responsibility | Consistency Model |
| :--- | :--- | :--- | :--- |
| **Logic Layer** | `requestAnimationFrame` + `performance.now()` | `currentTime` state increments | Elastic (React state updates) |
| **Animation Layer** | `setInterval` (10 FPS) | Local loop of index-based frames | Reset-on-Pause (Drifts from Logic) |
| **Export Layer** | `requestAnimationFrame` | Static drawing of state to canvas | Dependent on UI logic loop parity |

### Critical Inconsistency: The "Hybrid Duration" Gap
The system currently performs a real-time check against `audioRef.current.duration` to determine if a scene has finished.
- **Problem**: If network latency delays audio metadata, the scene duration might suddenly "snap" longer mid-playback once the buffer populates.
- **Problem**: During rapid seeking, the audio duration might not be immediately available to the logic loop, leading to premature scene transitions.

---

## 2. Drift Points & Accuracy Loss

### Animation Phase-Shift
The `StretchAnimationPlayer` does not respect the `currentTime` provided by the workspace. It resets to `frame_001` every time `isPlaying` or `isPreparing` toggles.
- **Drift**: If a user pauses at 5.5s and resumes, the animation starts at 0s while the scene is mid-way.
- **Audit Requirement**: Animation frames MUST be computed as `Math.floor(currentTime * fps) % totalFrames`.

### React Render Lag
The `renderLoop` (for export) reads `currentTime` from a `Ref` that is synced via `useEffect`.
- **Drift**: `useEffect` runs *after* the render committed to the DOM. This means the export loop is always at least 1-2 frames behind the logic state, and potentially more if the main thread is saturated.

---

## 3. Seek Determinism
Currently, "Seeking" is implemented as a "Jump-to-Start" mechanism.
- **Capability**: Clicking a scene in the timeline resets `currentTime` to 0.
- **Gap**: There is no "Playhead Scrubbing" (fine-grained seek within a scene). Sub-second seeking is not possible.
- **Soundtrack Sync**: Soundtrack doesn't seek; it just plays/pauses. If a routine is long, the soundtrack will be out of its intended mood-phase compared to the same point after a manual seek.

---

## 4. Timeline Interaction Weight (Tactile Feel)
- **Scrolling**: Uses dual-factor dragging (Timeline vs NavRail). Horizontal scroll is linear and lacks inertia.
- **Zooming**: Implemented as discrete states (`compact`, `normal`, `expanded`). Lacks fluid zoom cadence or center-to-cursor scaling.
- **Scrubbing**: Non-existent. The user cannot drag the playhead.

---

## 5. Temporal Failure Calmness
### RAF Dropout
If the system drops frames during export:
- **Current Behavior**: The `currentTime` increment (dt) will be larger on the next frame. The export might skip these frames entirely in the output video because the capture stream is linked to the canvas render count.
- **Requirement**: Exporting must use a "Fixed Step" generator (deterministic time steps) instead of `performance.now()`.

### Background Tab Restoration
- **Behavior**: Guarded by `visibilitychange`.
- **Reconciliation**: On restore, it currently works correctly by resetting `lastTime`, but the music/soundtrack might experience a "pop" or phase-jump if descriptors weren't properly paused/resumed.

---

## 6. Recommendations for Refinement
1. **Unify Logic**: Move `currentTime` calculation into a centralized `Orchestrator` hook that specifically provides a `deterministicTime` during export.
2. **Phase-Lock Animations**: Pass `currentTime` into `StretchAnimationPlayer` and derive `frame` from it.
3. **Internal Scrubbing**: Implement playhead dragging across the timeline bounds.
4. **Fixed-Step Export**: During recording, the `renderLoop` should increment `currentTime` by exactly `1/fps` rather than using `performance.now()`.
5. **Atomic Metadata**: Pre-calculate routine total duration and per-scene duration *before* playback begins, instead of checking audio duration live.

## 7. Temporal Ownership Contracts

To prevent architectural drift and guarantee timeline coherence, the following temporal ownership contracts are absolute:

### Orchestrator Owns
- **Canonical time** (`currentTime`)
- **Playback progression** (Tick advancing, boundaries)
- **Seek state** (Authoritative temporal interrupts)
- **Playback lifecycle** (Play, pause, ended)
- **Drift reconciliation** (Absorbing deviations into one timeline)
- **Export timing** (Providing fixed-step deterministic progression)

### UI Owns
- **Visualization only** (React components strictly subscribe to the Orchestrator)
- **Interaction requests** (Dispatching Play, Pause, Seek commands to Orchestrator)
- **Rendering** (Mapping orchestrator time to visuals and CSS state)
- **Motion interpolation** (E.g., CSS transitions masking discretizations)

### Audio/Video Owns
- **Playback execution only** (Native decoding and playing)
- **Never authoritative timing** (If audio drifts, it must be re-synced to the Orchestrator, NOT the Orchestrator adapting to audio. Audio is a follower.)

### Export Owns
- **Frame capture execution only**
- **Never authoritative timing** (Frames are captured against the Orchestrator's forced step time, bypassing `performance.now()` completely during generation.)

