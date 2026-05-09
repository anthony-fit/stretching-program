# PHASE 14: CONTINUITY, IDENTITY & LONGITUDINAL INTELLIGENCE

## The Narrative Evolution
Phase 13 empowered the system to evaluate emotional arcs within a *single* timeline. Phase 14 scales this upward, bridging individual videos into an ongoing **Session-to-Session Narrative Progression**. Videos no longer exist in a vacuum—they represent the "next chapter" of the user's movement journey.

## Continuity Engine Layer
We introduced `src/lib/continuityEngine.ts` to manage this longitudinal state:
- **Recovery Debt:** It calculates how much accumulated fatigue the user carries over their last 5 exported videos (scaling factors depending on `pacingArc` intensity). If debt crosses 70/100, the system enforces decompression.
- **Identity Profile:** Forms a stable, evolving editorial signature (e.g., `restrained_cinematic`, `meditative_precision`, `athletic_documentary`).
- **Narrative Memory & Motifs:** It extracts recent `hooks` and `titles` to avoid robotic repetition and synthesize meaningful variation vs. familiarity.

## Progression Arcs via Evolution Context
`CompositionPlanner` now binds the generated `continuityState` to the prompt parameters supplied to `generateCompositionBlueprintViaLLM`.
The LLM no longer acts just as a director, it is now an *Adaptive Coach*, explicitly provided with:
- Suggested `Identity Profile`
- Quantitative `Recovery Debt`
- A definitive `Recommended Evolution` (e.g., "User is fresh. Build deeper intensity... Lean into athletic_documentary.")

## Preserving the Architecture
Crucially, **Continuity Intelligence does not mute orchestration or bypass governance**. It solely acts as guiding metadata for the LLM during the Generative Phase (Planner). 
- **Continuity influences planning.**
- **Governance validates structure.**
- **Perception evaluates experience.**
- **Orchestrator executes truth.**
