# Studio Viewport Layout Audit & Polish

## Overview
We identified that the `Footer` component was previously rendering globally across all routes within `App.tsx`. While beneficial for public product pages, this behavior disrupted the fullscreen layout of the `VideoStudioPage`, causing unnecessary scrolling, layout shifts, or blank space below the studio editor's timeline.

## Exact Files Changed
- `/src/App.tsx`

## Layout Strategy Used
1. **Route Detection**: Implemented `useLocation()` from `react-router-dom` in `App.tsx` to conditionally detect when the current route is `/studio`.
2. **Conditional Wrapper Constraints**: 
   - **For Studio (`/studio`)**: Switched the layout boundaries from `min-h-screen` to a forced `h-[100dvh] overflow-hidden`. The `<main>` container is also given `h-full flex flex-col relative overflow-hidden`. This aligns perfectly with the interior structural elements of `VideoStudioPage.tsx`, matching the browser's dynamically calculated viewport height perfectly (100dvh).
   - **For Public Pages (`/`, `/terms`, etc.)**: Retained standard `min-h-screen overflow-x-hidden` which allows natural organic scrolling, retaining the standard DOM rendering approach.
3. **Footer Pruning**: Prevented the `<Footer />` component from mounting entirely when the route is `/studio`.

## Remaining Layout Edge Cases
1. **Dynamic Viewport Height (`dvh`) Reflows**: On mobile browsers (Safari specifically), revealing or hiding the URL bar changes the `100dvh` computation slightly. The studio handles this fairly well, but rapid address-bar interactions might cause a minor flicker.
2. **On-Screen Keyboard Overlaying**: Activating an input on a mobile device might still push the layout upwards unexpectedly or cover timeline components. 

## Safest Future Approach (Multi-Workspace Context)
If multiple full-page editing interfaces or workspaces are created in the future (e.g. `/studio2`, `/live-editor`), applying this manually to every route in `App.tsx` will become messy via `pathname === '/studio' || pathname === ...`.

The safest strategy is to introduce **Layout Composites**:
1. Implement a `<PublicLayout>` that includes the `Footer`, standard `min-h-screen` behaviors, and any sticky navigation. Wrap product-based routes underneath it.
2. Implement a `<WorkspaceLayout>` tailored for complex tooling, ensuring `100vh`/`100dvh` absolute constraints with strict scrolling disabled, and zero global footers. Wrap the editor routes underneath this layout.
