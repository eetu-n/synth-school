# Modular Learning Path (`src/lib/modular`)

Minimal modular synth learning path using `@xyflow/svelte`.

## Files

- **[`types.ts`](types.ts)**: Minimal definitions for `ModuleNode` (`title`, `href`, `phase`, optional `allowedTargets`) and `CableEdge`.
- **[`cablePhysics.ts`](cablePhysics.ts)**: Catenary droop Bézier curve calculation and spring-damper animation controller (`CableSpringAnimation`).

## Components (`src/lib/components/modular`)

- **`ModularRack.svelte`**: SvelteFlow canvas with horizontal scroll, automatic phase-based module layout, and next-phase connection validation.
- **`SynthModuleNode.svelte`**: Rounded rectangle module with a title link, TS jack input handle, and TS plug output handle poking out the side.
- **`TsJack.svelte`**: 2D SVG representation of a TS mono audio jack socket with hexagonal mounting nut, collar ring, and contact spring.
- **`TsPlug.svelte`**: 2D SVG representation of a TS mono audio plug (strain relief boot, grip barrel, metallic sleeve, insulator band, and tip; supports full view and inserted view).
- **`PatchCableEdge.svelte`**: Droopy Bézier curve cable with spring physics, source cable boot, and TS plug inserted into the target TS jack.
- **`PatchConnectionLine.svelte`**: Custom connection line rendering the droopy cable in real time with the TS plug moving at the cursor while dragging to create a new connection.
- **`RackScrollMapper.svelte`**: Maps vertical mouse wheel events to horizontal rack scrolling.
