# Adaptive Media Normalization & Smart Framing Report

## Exact Files Changed
- `/src/pages/VideoStudioPage.tsx`
- `/src/components/StretchAnimationPlayer.tsx`

## Classification Heuristics Used
We implemented a non-AI, lightweight heuristic engine based strictly on intrinsic image metadata (`naturalWidth` / `naturalHeight`). We intercept `onLoad` within the `<StretchAnimationPlayer>` to cache `mediaStats`, while performing the exact identical synchronous calculations inside the `.webm` exporter `renderLoop`.

The classifications are:
1. **Low-Resolution** (`w < 600` or `h < 600`): Up-scaling forces visible pixelation.
2. **Portrait-like** (`ratio < 0.8`): Highly susceptible to top/bottom clipping (head/limbs) during zooms.
3. **Landscape-like** (`ratio > 1.2`): Safe for wide panning and aggressive zoom scaling.
4. **Square-like / Close-up Candidates** (`ratio >= 0.8 && ratio <= 1.2`): Generally tightly cropped by default; zooming intensely often cuts out the subject entirely.

## Adaptive Framing Strategy
We dynamically clamp and modifier the unified **Framing Modes** based on classification:
- **Low Resolution Lockdown**: Any asset flagged as low-res is forcibly downgraded to `Fit` mode (`scale: 0.95`, no motion), preventing fuzzy up-scaled artifacts and guaranteeing safe margins.
- **Portrait Safety Guard**: Automatically demotes `Cinematic` motion to `Focus` mode (`scale: 1.02` static) on portrait media. This stops the vertical `y: 5` to `y: -5` sweeping motion that was slicing off the heads or feet of standing figures.
- **Micro-Scale Close-up Softening**: For "square-like" assets (acting as our close-up proxy heuristic) using `Cinematic`, we apply a `0.5x` dampening scalar to both zoom and pan values, preventing motion sickness or immediate face-clipping.
- **Landscape Hero Emphasis**: Landscape assets running in `Cinematic` securely apply a `1.2x` zoom & `1.5x` pan multiplier, letting wider shots utilize the motion sweep perfectly without edge bleeding.

## Parity Guarantee
Both the framer-motion DOM properties `initial/animate` and the `<canvas>` export transformations (`exportScale`, `yOffset`) receive identical calculations. The canvas calculates `yOffset` dynamically via exactly re-derived progress math (`(1 - progress * 2)` matching the DOM duration sweep).

## Remaining Limitations Before AI Intervention
Without Machine Learning (`MediaPipe`/`PoseNet`/`CenterNet`), we cannot guarantee *per-pixel* where a human face resides. If a Landscape image has the person standing completely off to the top-right corner, applying our standard center-pivot cinematic scaling will crop them out, regardless of how safe the landscape heuristics are. True semantic cropping requires face/pose coordinate extraction.

## Safest Future Upgrade Path
To implement intelligent auto-framing WITHOUT costly backend AI infrastructure, you can integrate standard lightweight client-side pose/face bounds leveraging **TensorFlow.js (tfjs-models/blazeface or posenet)**. Running this over the images inside the browser once upon generation would yield bounding boxes `[x, y, w, h]`, allowing us to dynamically map the CSS `transform-origin` and canvas `drawImage` source-coordinates so the subject *always* dictates the gravitational center of the zoom arc.
