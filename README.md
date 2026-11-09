# Synth School

An interactive web-based synthesizer education platform built with SvelteKit, Svelte 5, Faust WebAssembly DSP, and Tailwind CSS.

## Architecture & Project Structure

- **`src/lib/audio/`**: Core audio engine.
  - `dsp/`: Faust DSP source scripts compiled to WebAssembly.
  - `framework/`: Audio graph abstractions and lifecycle management (see [`src/lib/audio/framework/README.md`](src/lib/audio/framework/README.md)).
  - `nodes/`: Custom audio graph nodes and analysis utilities (see [`src/lib/audio/nodes/README.md`](src/lib/audio/nodes/README.md)).
- **`src/lib/modular/`**: Modular learning path and patch cable system (see [`src/lib/modular/README.md`](src/lib/modular/README.md)).
- **`src/lib/components/`**:
  - `audio/`: Synthesizer demo components and instruments.
  - `ui/`: Reusable controls, layout containers, and visualizers (see [`src/lib/components/ui/viz/README.md`](src/lib/components/ui/viz/README.md)).
- **`src/routes/`**: Lesson routes and interactive tutorials.

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
