# Modular Learning Path (`src/lib/modular`)

Minimal modular synth learning path using `@xyflow/svelte`.

## Files

- **[`types.ts`](types.ts)**: Minimal definitions for `ModuleNode` (`title`, `href`, `phase`, optional `allowedTargets`) and `CableEdge`.
- **[`cablePhysics.ts`](cablePhysics.ts)**: Catenary droop Bézier curve calculation and spring-damper animation controller (`CableSpringAnimation`).

## Components (`src/lib/components/modular`)

- **`ModularRack.svelte`**: SvelteFlow canvas with horizontal scroll, automatic phase-based module layout, and next-phase connection validation.
- **`SynthModuleNode.svelte`**: Rounded rectangle module with a title link and single input/output handles.
- **`PatchCableEdge.svelte`**: Droopy Bézier curve cable with spring physics only when creating cables or moving modules.
- **`PatchConnectionLine.svelte`**: Custom connection line rendering the droopy cable in real time while dragging to create a new connection.
- **`RackScrollMapper.svelte`**: Maps vertical mouse wheel events to horizontal rack scrolling.
