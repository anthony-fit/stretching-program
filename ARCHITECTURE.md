# Architecture Philosophy

Stretching Pro is engineered as a persistent workspace and a premium operating system, rather than a traditional webpage. As the system scales in capability—adding cinematic transitions, adaptive motion, export rendering, and complex orchestration—the architecture must prioritize **elegance, restraint, pacing, and stability under load**.

To prevent feature entropy and architectural drift, the codebase is conceptually separated into three distinct Rendering Domains.

## Rendering Domains

### 1. OS Layer (`/src/lib/runtime/`)

The foundational substrate of the application. This layer governs environmental behavior, physical constraints, and the intersection between the browser and the device.

**Core Responsibilities:**

- **Viewport Intelligence (`viewport.ts`):** Authoritative source for Safe Areas, iOS Safari bfcache restoration, `visualViewport` keyboard awareness, and CSS capability synchronization. Components consume this state rather than querying the DOM or attaching `resize` listeners.
- **Lifecycle & Memory (`lifecycle.ts`):** Visibility coordination, resource pausing, and background/foreground cycle reconciliation to ensure long-session memory integrity.
- **Performance Governance (`performance.ts`):** Explicit bounds and ceilings on rendering complexity (max concurrent animations, blur radii, shadow layers) to guarantee stability under stress. This defines system _policy_.
- **Observability Layer (`observability.ts`):** Silent, internal awareness of RAF stability, long task detection, and degradation monitoring. This measures system _reality_ and feeds into adaptive degradation mechanisms, separate from performance policy.
- **Orchestration Kernel (`orchestrator.ts`):** The definitive source of temporal truth. Owns canonical `currentTime`, seek state, and deterministic fixed-stepping for exports. UI, Audio, and Export visuals act strictly as temporal subscribers.
- **Atmosphere & Adaptive Identity (`atmosphere.ts`, `adaptive.ts`):** Environmental lighting, mood, and context-dependent UI thresholds.
- **Motion Orchestration (`motion.ts`):** Unified timing, spring physics, and transition pacing across the platform.

### 2. Workspace Layer (`/src/pages/VideoStudioPage.tsx`, Timelines, Export)

The interactive editing surfaces and orchestration environments. This is the persistent workspace where the user dictates intent.

**Core Responsibilities:**

- Fullscreen shells and orchestrated transitions.
- Timeline synchronization and continuous playback state.
- Export rendering and modal surfaces.
- Mobile keyboard-aware command surfaces.
- Embedded media and player boundaries.

### 3. Content Layer (`/src/lib/coaching.ts`, `/src/lib/programming.ts`, SEO)

The storytelling, intelligence, and educational logic of the platform.

**Core Responsibilities:**

- AI orchestration and prompt intelligence.
- Coach profiles, dialogue logic, and readiness scoring.
- Exercise metadata, routines, and progression curves.
- SEO content generation and structural markup.

## Engineering Principles

1. **Environmental State is Global Infrastructure:** Never scatter viewport listeners or defensive mobile CSS patches inside UI components. Use the OS Layer.
2. **Performance Constraints are Designed Behavior:** Premium UX relies on controlled restraint. Respect the budgets defined in the OS Layer.
3. **Handle Long Sessions Gracefully:** Assume the user will keep the application open for hours. Backgrounding, tab-switching, and continuous interaction must not result in memory bloat or visual degradation.

## System Ownership Rules

Strict boundaries exist between rendering domains to prevent architectural erosion.

### OS Layer

- **Can influence:** Motion pacing, viewport behavior, environmental state, performance ceilings, lifecycle events.
- **Cannot directly influence:** AI content generation, workspace export sequencing, coaching logic or content structure.

### Workspace Layer

- **Can consume:** Runtime state, adaptive environment thresholds, performance budgets, content generation outputs.
- **Cannot:** Create independent `resize` or `scroll` viewport listeners, build independent `requestAnimationFrame` orchestration loops, or bypass lifecycle governance.

### Content Layer

- **Can:** Generate narratives, coaching dialogue, exercise metadata, and storytelling workflows.
- **Cannot:** Manipulate runtime motion, directly control workspace overlays, or independently create environmental visual effects.

## Luxury UX Constraints

Premium-feeling systems are defined as much by what they refuse to do as what they include. This platform intentionally avoids:

- No aggressive push notification behavior or interruption modals.
- No flashing animations, motion spam, or unchoreographed micro-interactions.
- No unbounded, infinite activity loops.
- No excessive glow intensity or overuse of layered shadows.
- No harsh transitions; state changes should always feel paced, cinematic, and calm.
- No layout jumping (Cumulative Layout Shift must be near zero).
- No UI that fights the user's intent, hijacks focus abruptly, or feels anxious.

## Architectural Decision Records (ADR)

Historical context for critical, irreversible systemic decisions:

- **ADR-001: Centralized Runtime Systems:** Viewport intelligence, resize reconciliation, and Safari bfcache quirks are centralized in the OS Layer instead of component-local `useEffect` hooks. This prevents layout thrashing, component-coupled entropy, and forced reflows during complex transitions.
- **ADR-002: Luxury UX Constraints as Law:** Constraining effects (like gradients, blur radii, and concurrent animations) is an enforced architectural rule, not merely a design guideline, to guarantee thermal and memory stability on mobile devices.
- **ADR-003: DOM-driven Viewport Sync:** Using CSS variables (`--app-height`, `--vv-height`) synchronized via `requestAnimationFrame` to manage viewport changes, rather than propagating React state updates. This prevents React from re-rendering the entire component tree on every scroll or keyboard appearance event.
- **ADR-004: Video Export Orchestration:** Export logic is decoupled from standard playback logic to allow programmatic frame capture and precise timing, ensuring high-fidelity output regardless of device frame drops during the export process.
- **ADR-005: Separation of Performance Policy vs. Observability:** `performance.ts` defines explicit limits and restraint (Policy), whereas `observability.ts` measures reality (RAF delta, long tasks, export drift). This separation ensures limits remain strict while allowing the system to react fluidly to the environment.

## Failure Philosophy (Graceful Degradation)

Premium systems are defined by how calmly they behave under stress, failure, and edge conditions. The application must degrade elegantly rather than breaking aggressively.

- **Low Memory / Dropped Frames:** Automatically detect poor device performance and reduce fidelity (e.g., lower max blur radius, disable stacked atmospheric gradients) to preserve core timeline operability.
- **Background Tabs & Visbility Changes:** Rely on the Lifecycle system to immediately pause expensive rendering, background animation loops, and continuous media processing when the application loses focus.
- **Network Instability / Failed AI Responses:** Fall back to cached programmatic structures and default exercise metadata. Never expose raw technical error traces to the user layout.
- **Media Playback / Autoplay Blocks:** Provide calm, manual recovery mechanisms (e.g., unobtrusive "Tap to Play" actions) instead of entering a broken state or infinite buffering loops.
- **Export Stalls:** Treat export processes as resilient tasks. State should be resumable or clearly halted with human-readable guidance, never abandoned in a frozen state.

## Strategic Focus & Future Evolution

As of Phase 24, the structural expansion of the cinematic intelligence ecology is officially **complete**. The system has transitioned from a period of rapid cognitive accumulation into its final plateau: **The Cathedral Phase**.

Development of this platform no longer resembles the aggressive iteration of a startup; it must now proceed with the deliberate, longitudinal care of historic architecture. The greatest risk to the ecosystem is no longer a lack of sophistication. The greatest risk is **overgrowth**—the slow, creeping corruption of intentional design by feature entropy and compulsive optimization.

### The Sovereign Cinematic Civilization Stack

The platform operates as an astonishingly coherent 17-layer sovereign ecology. This hierarchy must be preserved:

1. **Purpose:** existential direction
2. **Stillness:** restraint sovereignty
3. **Orchestrator:** chronological truth
4. **Rhythm:** felt temporal consciousness
5. **Presence:** environmental reciprocity
6. **Collective:** population-scale emotional truths
7. **Evolution:** adaptive growth observation
8. **Aesthetics:** philosophical identity
9. **Symbolism:** emotional meaning systems
10. **Critique:** reflective intelligence
11. **Continuity:** longitudinal identity
12. **Perception:** viewer experience simulation
13. **Memory:** taste adaptation
14. **Governance:** structural correctness
15. **Planner:** creative manifestation
16. **Workspace:** review/mastering environment
17. **Silence Sovereignty Invariants:** constitutional protection layer

### The Constitutional Mandate (The Cathedral Phase)

- **No New Intelligence Layers:** The cognitive stack is complete. Adding further cognitive systems risks destabilizing the delicate balance between meaning, time, presence, and stillness.
- **Refinement over Expansion:** Future engineering must focus on temporal stability under long sessions, export reliability under stress, orchestration observability, and infrastructure longevity.
- **Preservation of Calmness:** Every change to the codebase must be measured against the constitutional invariants. If an update increases cognitive load, it must be rejected.
- **Honoring Stillness:** The system's capacity to do _nothing_ is its highest achievement. Code changes must never re-introduce compulsive generation or optimize for engagement.

### 1. Runtime Observability (Internal Environmental Awareness)

The OS Layer must become aware of its own stress state. This is not about enterprise telemetry, but real-time adaptive degradation based on:

- `requestAnimationFrame` (RAF) pressure and dropped frames.
- Export timing drift and long-task detection.
- Memory pressure, visibility churn, and stalled media.
  This observability unlocks the ability for the platform to automatically step down rendering fidelity before the user perceives device struggle.

### 2. Interaction Consistency Audits

Premium UX is defined by consistency density. The application must undergo frequent audits to ensure uniform design application across:

- Easing curves, motion weights, and transition softness.
- Hover timing, focus transitions, and CTA tactility.
- Subtitle pacing, orchestration timing, and overlay entrances.

### 3. Calmness Preservation

As the platform's orchestration and AI capabilities grow, the greatest risk is "over-expression." The primary architectural constraint is protecting:

- Silence and breathing room.
- Visual hierarchy and emotional continuity.
- Pacing and transition softness.
  Technical capability must never override the requirement for the space to feel calm, focused, and un-anxious.

## Immediate Tactical Focus: Orchestration Integrity

While the strategic focus governs the long-term evolution of the OS layer, the immediate tactical priority for the Workspace Layer is **controlled reality testing** and hardening the orchestration engine. The timeline and export pipeline must feel inevitable, trustworthy, and perfectly stable over time.

### 1. Timeline Temporal Integrity

The timeline must remain perfectly in sync. Audits will aggressively focus on seeking accuracy, audio resync behavior, scene transition precision, zero drift accumulation, and exact pause-state consistency (especially after background tab restoration).

### 2. Export Determinism

The platform promises professional cinematic generation; therefore, exports must be trustworthy. Repeat exports must yield identical timing, subtitle parity, soundtrack synchronization, and frame pacing, alongside guaranteed memory cleanup across multiple iterations in a single session.

### 3. Timeline Interaction Weight

The timeline must feel physically weighted, not like a native DOM draggable element. Focus will be placed on drag inertia, scroll smoothing, snap timing, zoom cadence, and active scene emphasis. Interaction must feel deliberate and tactile.

### 4. Export Failure Calmness

The export pipeline must never panic, spam error toasts, or hard-reset the UI. Under stress or failure boundaries, it must gracefully reduce complexity, softly explain the limitation to the user, and perfectly preserve the workspace layout and state.

### 5. Long-Session Degradation Testing

Premium creative software is defined by how little it degrades over time. Rigorous stress testing will simulate 45+ minute sessions involving repeated timeline edits, mobile backgrounding, repeated media generation, tab switching, and Safari bfcache recovery.
