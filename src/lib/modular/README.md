# Modular Learning Path (`src/lib/modular`)

Interactive module graph and droopy patch cable system with drag-and-drop patching, spring physics, and responsive layouts.

- `types.ts`: Module graph types, node/edge definitions, and handle coordinates.
- `cablePhysics.ts`: Catenary droop Bézier curve calculations and spring-damper physics animation.

UI components live in `src/lib/components/modular/` (`ModularRack.svelte`, `SynthModuleNode.svelte`, `PatchCableEdge.svelte`, `PatchConnectionLine.svelte`, `TsJack.svelte`, `TsPlug.svelte`).
