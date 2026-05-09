# Preview Containment & Visibility Fix Report

## Exact Files Changed
- `/src/pages/VideoStudioPage.tsx`
- `/src/components/StretchAnimationPlayer.tsx`

## Root Cause of Clipping
The root cause was a combination of **flexbox height collapse** and **aspect-ratio override behavior**. The `Video Stage` wrapper was using CSS classes like `w-full aspect-[16/9]`. In a flex container with `min-h-0`, forcing width to 100% mathematically forces the height to maintain the ratio. If the generated height was taller than the user's viewport flex container, the `overflow-hidden` on the flex wrapper aggressively clipped the top and bottom of the composition (destroying visibility for subtitles and overlays). Furthermore, Safari was occasionally bleeding scaled layers through `<motion.div>` elements due to missing GPU isolation.

## Exact Containment Strategy Used
1. **SVG Auto-Scaling Bounding Box**: I ripped out the CSS aspect-ratio logic on the main composition `.bg-cream` stage. Instead, I inserted an invisible SVG acting as an intrinsic strut:
   `<svg viewBox="0 0 16 9" className="max-w-full max-h-full w-[1000px] h-auto" />`
   By utilizing an SVG inside a flex boundary, the browser's native geometry engine scales the box down proportionally to fit whichever axis hits `100%` first, completely preventing overflow and clipping in all viewports.
2. **Absolute Composition Layering**: The media player (`StretchAnimationPlayer`), subtitles, and cinematic overlays are mapped to `<div className="absolute inset-0">` directly atop the SVG footprint, guaranteeing they are anchored safely and correctly.
3. **Safari Isolation Guards**: Added `z-0` and `isolation: isolate` to the core media container in `StretchAnimationPlayer.tsx` to ensure `transform: scale(1.15)` operations do not break the CSS `overflow: hidden` bounding box.

## Remaining Layout Limitations
- **Browser-Native Scale Scaling**: Because we rely on native DOM layout size changes for `16:9` vs `9:16`, elements styled using static pixels or `rem` (like subtitles `p-8` or `text-lg`) do not inherently shrink smoothly; they will reflow instead.
- **Overlay Opacity vs Transforms**: During `Subtle` or `Medium` transitions, the scene layers cross-fade nicely, but they still act as completely detached layers structurally. They cannot apply pixel-level distortion or mesh-warping like a native video editor.

## Safest Future Path for Advanced Motion
To build highly complex animation templates (like zooming dynamically into a text bounding box) WITHOUT destabilizing layout stability or breaking export bounds, the architecture needs to transition from declarative DOM node measuring (`framer-motion`) into a **Single Canvas Renderer** for both the Preview AND the Export pipeline—treating React purely as a state machine. `React Three Fiber` combined with `@remotion/player` is the safest evolution to ensure absolute pixel parity.
