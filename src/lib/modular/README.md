# Modular Learning Path (`src/lib/modular`)

Minimal modular synth learning path using `@xyflow/svelte`.

## Files

- **[`types.ts`](types.ts)**: Minimal definitions for `ModuleNode` (title and href) and `CableEdge`.
- **[`cablePhysics.ts`](cablePhysics.ts)**: Catenary droop Bézier curve calculation and spring-damper physics.

## Components (`src/lib/components/modular`)

- **`ModularRack.svelte`**: SvelteFlow canvas accepting `nodes`, `edges`, and `isValidConnection` validator as props.
- **`SynthModuleNode.svelte`**: Rounded rectangle module with a title link and single input/output handles.
- **`PatchCableEdge.svelte`**: Droopy Bézier curve cable with spring physics only when creating cables or moving modules.
- **`PatchConnectionLine.svelte`**: Custom connection line rendering the droopy cable in real time while dragging to create a new connection.
