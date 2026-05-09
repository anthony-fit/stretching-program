# PHASE 11: COMPOSITION GOVERNANCE & STRUCTURAL INTELLIGENCE

## The Missing Editorial Layer
Before Phase 11, the LLM had unconstrained generative capability over the composition blueprint. However, unconstrained LLM execution leads to composition entropy (repetitive movements, emotional flatness, impossible pacing, uncontrolled subtitle density).

We solved this by introducing **Composition Governance** (`compositionGovernance.ts`). It acts as a formal declarative rule engine separating the _creative_ LLM from the _determinisitic_ Orchestrator.

## Core Conceptual Flow
1. **User Intent** (Parameters)
2. **LLM Composition Draft** (`CompositionPlanner`) 
3. **Composition Governance Layer** (Rule Validation & Rectification)
4. **Validated Blueprint** 
5. **Orchestrator** (Mastering & Execution)

## Governing Rules Established
 - **Duration Integrity:** It asserts exactly correct durations, prorating scene times slightly to correct LLM duration drift and exactly match the user's requested time constraints.
 - **Cognitive Load & Subtitle Density:** It scans LLM generated narration against scene duration. If spoken word per second (WPS) exceeds limits (e.g. `> 3.2`), the narration text is strictly trimmed back to prevent "subtitle spamming".
 - **Movement Variety constraints:** It tracks IDs against a repetition limit (e.g. `MAX_REPETITIONS_PER_WORKOUT`). 
 - **Fallback Integrity:** Enforces camera behavior and energy level existence on scene objects.

## Blueprint Versioning
Generative reproducibility becomes paramount once AI dictates structure. We introduced `.metadata` injections into the Blueprint resolving the following:
- `blueprintVersion`
- `orchestrationVersion`
- `compositionModel`
- `governanceProfile`
- `generationSeed`

This establishes the ability to re-invoke or re-render an exact creative state reliably in the future.
