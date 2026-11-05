# Synth School

An interactive web-based synthesizer education platform built with SvelteKit, Svelte 5, Faust WebAssembly DSP, and Tailwind CSS.

## Architecture & Project Structure

- **`src/lib/audio/`**: Core audio engine.
  - `dsp/`: Faust DSP scripts (`.dsp` and `.lib` files compiled to WebAssembly via `vite-plugin-faust`).
  - `framework/`: Audio graph abstractions and lifecycle management (see [`src/lib/audio/framework/README.md`](src/lib/audio/framework/README.md)).
  - `nodes/`: Custom audio nodes and analysis utilities (see [`src/lib/audio/nodes/README.md`](src/lib/audio/nodes/README.md)).
- **`src/lib/modular/`**: Modular learning path & droopy patch cable system (see [`src/lib/modular/README.md`](src/lib/modular/README.md)):
  - `types.ts`: Lightweight definitions for modular nodes and cables.
  - `cablePhysics.ts`: Physics engine for gravity-drooped Bézier curves and spring-damper cable oscillation.
- **`src/lib/components/modular/`**: Modular UI components:
  - `ModularRack.svelte`: SvelteFlow canvas presenting the modules and cables.
  - `SynthModuleNode.svelte`: Simple rounded-rectangle module card linking directly to lesson part 1.
  - `PatchCableEdge.svelte`: Physically animated droopy Bézier curve patch cable with interactive twang.
  - `PatchConnectionLine.svelte`: Real-time droopy cable preview while dragging out new patch connections.
- **`src/lib/components/audio/`**: High-level synthesizer and audio components:
  - `SubtractiveSynth.svelte`: Full subtractive synthesizer UI (waveform selection, frequency, gain, filter cutoff/resonance, ADSR envelope, gate button).
  - `AdsrDemo.svelte`: ADSR-focused envelope synthesizer UI based on SubtractiveSynth with built-in `AdsrVis` envelope graph visualization (toggleable via `showVisualization`, true by default).
  - `StaticSubtractiveSynth.svelte`: Non-interactive/display preset synthesizer node with gate/hold trigger.
  - `FilterDemo.svelte`: Interactive filter demonstration and frequency response visualization.
  - `SinSynth.svelte`, `AdditiveSaw.svelte`, `AdditiveSquare.svelte`, `AdditiveTriangle.svelte`, `Noise.svelte`, `MockResample.svelte`: Targeted demonstration synths and oscillators.
- **`src/lib/components/ui/`**: Reusable UI widgets:
  - `inputs/`: Audio controls (`Knob.svelte`, `Radio.svelte`, `HSlider.svelte`, `GateButton.svelte`).
  - `layout/`: Presentation containers (`VSplitDiv.svelte`, `AudioOverlay.svelte`, `QuizLayout.svelte`).
  - `viz/`: Visualizers such as spectrum analyzer, oscilloscope, and envelope curves (see [`src/lib/components/ui/viz/README.md`](src/lib/components/ui/viz/README.md)).
- **`src/routes/`**: Lesson paths and interactive tutorials:
  - `lessons/`: Lesson modules

## Theming & Color System

Colors are defined in [`src/app.css`](src/app.css) using a single-tier CSS custom property system:

- **Light-mode values** live in the Tailwind `@theme` block as `--color-*` tokens (e.g. `--color-primary`, `--color-surface`, `--color-grid`).
- **Dark-mode overrides** are set via `:root.dark { --color-*: ... }`, toggled by adding/removing the `dark` class on `<html>` in [`+layout.svelte`](src/routes/+layout.svelte).
- Tailwind utilities (`bg-primary`, `text-text-secondary`, etc.) reference these tokens automatically.
- Canvas-based components (`Frequency.svelte`, `Scope.svelte`) read colors at draw time via `getComputedStyle(...).getPropertyValue('--color-*')`.
- SVG components (`AdsrVis.svelte`, `SignalAddition.svelte`) use `var(--color-*)` directly in attributes.

| Token | Usage |
|---|---|
| `--color-primary` | Main accent (teal) |
| `--color-secondary` | Highlight accent (orange) |
| `--color-surface` | Card/panel background |
| `--color-background` | Page background |
| `--color-border` | Borders and slider tracks |
| `--color-grid` | Chart grid lines |
| `--color-text-primary` / `--color-text-secondary` | Body text |
| `--color-signal-actual` / `--color-signal-aliased` | Aliasing lesson signal colors |
| `--color-passband` / `--color-stopband` / `--color-transitionband` | Filter band region colors |

## Development

The project includes a `shell.nix` providing required tools (`bun`, `faust`).

```bash
# Start development server
nix-shell --run "bun dev"

# Typecheck and Svelte check
nix-shell --run "bun check"

# Build production bundle
nix-shell --run "bun run build"
```
