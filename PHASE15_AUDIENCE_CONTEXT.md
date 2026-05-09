# PHASE 15: AUDIENCE CONTEXT & DISTRIBUTION INTELLIGENCE

## The Shift to Ecosystem Awareness
Previously, the architecture generated an adaptive, structurally governed timeline perfectly optimized for the `Creator` and their longitudinal timeline. However, it treated all publishing as equal. Phase 15 incorporates the **Audience Context**, allowing the generated cinematic output to subtly adapt based on *where* and *how* the composition will be viewed.

## Contextual Layers Introduced
We introduced `src/lib/distributionIntelligence.ts`, building environment-aware orchestration tools:
- **Platform Intelligence:** Adjusts scene pacing visually. For example, scrolling velocity on short-form platforms (TikTok/Instagram) reduces `maxInitialSceneDuration` to 6s, requiring rapid visual establishment compared to YouTube's more patient 15s standard. 
- **Environmental Context:** The system evaluates where the consumer is (e.g., `morning_activation` vs. `nighttime_recovery`). Nighttime recovery naturally restrains interval/wave pacing and trims out emotional peaking in favor of `calming_reassurance` hooks and `nighttime_low_pressure` subtitle cadences.
- **Audience Mode Muting:** If the system knows `soundAvailability` is muted (or on `silent_autoplay`), it adjusts subtitle prioritization (`accessibility_forward`) to avoid losing viewers to non-verbal cues.

## Perception Penalties Applied
The `simulateViewerExperience()` logic internal to `src/lib/perceptionModel.ts` was expanded to evaluate the **contextual appropriateness** of a timeline.
- It will heavily penalize high silence periods in high-scroll feeds, while simultaneously penalizing low breathing room in long-form platforms.
- It enforces emotional consistency. An interval-style pacing generated for nighttime context will be harshly penalized.

## Generative Separation Validated
The LLM Prompt Generation passes down the constraints directly. If the Distribution environment calls for a specific hook style, the LLM is guided to that exact emotional cadence.
Crucially, **Distribution adapts Presentation, but Continuity preserves Identity.**
The architecture does not sacrifice the product's underlying calm-authoritative signature just to gain fast engagement on social networks. Distribution Intelligence adjusts the temporal orchestration of the entry point while maintaining the longitudinal personality of the user's journey.
