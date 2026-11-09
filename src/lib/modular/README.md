# Modular Learning Path (`src/lib/modular`)

Interactive module graph and droopy patch cable system with drag-and-drop patching, spring physics, and responsive layouts.

- `constants.ts`: Hardware geometry (jack/plug dimensions) and rack spacing constants.
- `types.ts`: Module graph types, node/edge definitions, and handle coordinates.
- `rackLayout.ts`: Responsive desktop (LTR) and mobile (bottom-up) layout positioning.
- `rackState.svelte.ts`: Reactive state management rune for panning, dragging, snap targets, and connection validation.
- `cablePhysics.ts`: Catenary droop Bézier curve calculations and spring-damper physics animation.

UI components live in `src/lib/components/modular/` (`ModularRack.svelte`, `SynthModuleNode.svelte`, `PatchCableEdge.svelte`, `PatchConnectionLine.svelte`, `TsJack.svelte`, `TsPlug.svelte`).
