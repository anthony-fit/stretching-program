# Shortcut & Editor Polish Report

## Exact Files Changed
- `/src/pages/VideoStudioPage.tsx`

## Shortcut Map Implemented
- **Space**: Toggle Play/Pause
- **Left Arrow**: Go to previous scene in timeline & reset playback time
- **Right Arrow**: Go to next scene in timeline & reset playback time
- **Shift + Left Arrow**: Seek backward 5 seconds within the current scene
- **Shift + Right Arrow**: Seek forward 5 seconds within the current scene (safely capped by playback engine)
- **Escape**: Stop playback/export by instantly pausing
- **Delete / Backspace**: Remove currently selected scene (with auto-focus adjustment)
- **Cmd/Ctrl + D**: Duplicate currently selected scene (inserts replica to the immediate right)
- **Cmd/Ctrl + Z**: Lightweight timeline structure undo
- **Cmd/Ctrl + S**: Intercepts native save dialog (relies on background autosave loop)

*Note*: All shortcuts are safely ignored if the user is typing inside an `<input>`, `<textarea>`, or `[contenteditable]` block.

## Undo Architecture Used
**Stack-based full-state snapshots (Lightweight):**
Given the timeline's relatively small JSON footprint, undo relies on an `undoStack` holding an array of `StoryboardItem[]`.
Whenever a destructive structural change happens (`addToStoryboard`, `removeFromStoryboard`, `duplicateItem`, `moveItem`, or duration adjustments), the pre-change `storyboard` state is appended to the stack via `pushUndo()`. The stack is hard-capped at 20 steps to prevent massive memory usage.
When `handleUndo` triggers, it pops the last state, injects it back directly into `setStoryboard`, and safely recalculates the `activeItemIndex` to ensure no out-of-bounds pointer crashes occur.

## Remaining Limitations
1. **Action-less modifications (e.g. pure selection)**: Undo doesn't keep track of where your pointer was exactly, just limits out-of-bounds. Real editors persist cursor positions in the undo stack.
2. **Global scope limitations**: The undo stack ONLY tracks the `storyboard` timeline array. Things like SEO changes, changing aspect ratio, and editing AI script text are not unified under this undo boundary.
3. **No Redo**: This is strictly an undo history stack. Branching timeline versions or 'redo' aren't supported. 

## Safest Future Upgrade Path
Before advanced command systems (like Redux or a specialized CQRS command bus) become worthwhile, you should adopt a **Command Pattern Engine** at the component level.
- Create an `ExecutionStack` class or hook.
- Move from "Set state directly" to "Dispatch action `{ type: "MOVE_ITEM", from: X, to: Y }`".
- Let a unified reducer handle state mutation while seamlessly storing the inverse operation (e.g., "moving back to X, from Y") as the undo action.
- This gives you the lowest memory overhead possible while seamlessly enabling deep Redo architectures, WITHOUT breaking existing playback bindings.
