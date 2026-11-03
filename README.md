# Synth School

An interactive web-based synthesizer education platform built with SvelteKit, Svelte 5, Faust WebAssembly DSP, and Tailwind CSS.

## Architecture & Project Structure

- **`src/lib/audio/`**: Core audio engine.
  - `dsp/`: Faust DSP scripts (`.dsp` and `.lib` files compiled to WebAssembly via `vite-plugin-faust`).
  - `framework/`: Audio graph abstractions and lifecycle management (`FaustNode`, `RoutedAudioNode`, `RouterNode`, `AudioContextManager`, `audioState`).
  - `nodes/`: Custom audio nodes and analysis utilities (e.g., `CascadingFilterNode`, `FilterResponseAnalyzer`).
- **`src/lib/components/audio/`**: High-level synthesizer and audio components:
  - `SubtractiveSynth.svelte`: Full subtractive synthesizer UI (waveform selection, frequency, gain, filter cutoff/resonance, ADSR envelope, gate button).
  - `AdsrSynth.svelte`: ADSR-focused envelope synthesizer UI based on SubtractiveSynth with sensible defaults for oscillator and filter parameters.
  - `StaticSubtractiveSynth.svelte`: Non-interactive/display preset synthesizer node with gate/hold trigger.
  - `FilterDemo.svelte`: Interactive filter demonstration and frequency response visualization.
  - `SinSynth.svelte`, `AdditiveSaw.svelte`, `AdditiveSquare.svelte`, `AdditiveTriangle.svelte`, `Noise.svelte`, `MockResample.svelte`: Targeted demonstration synths and oscillators.
- **`src/lib/components/ui/`**: Reusable UI widgets:
  - `inputs/`: Audio controls (`Knob.svelte`, `Radio.svelte`, `HSlider.svelte`).
  - `layout/`: Presentation containers (`VSplitDiv.svelte`, `AudioOverlay.svelte`, `QuizLayout.svelte`).
  - `viz/`: Visualizers such as spectrum analyzer (`Frequency.svelte`).
- **`src/routes/`**: Lesson paths and interactive tutorials:
  - `lessons/oscillators/`: Harmonic generation and waveform synthesis.
  - `lessons/filters/`: Cutoff, resonance, band types, and filter slopes.
  - `lessons/envelopes/`: Attack, Decay, Sustain, and Release (ADSR) dynamics.
  - `lessons/aliasing/`: Digital sampling and aliasing effects.
  - `lessons/synthQuiz/`: Interactive ear-training synth parameter matching quiz.

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
