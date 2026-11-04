# Audio Framework (`src/lib/audio/framework`)

Core Web Audio and Faust WebAssembly runtime abstractions for Synth School.

This module provides the audio graph infrastructure, manages the `AudioContext` lifecycle (respecting browser autoplay policies), manages Web Audio routing topologies, and integrates Faust DSP worklets into Svelte 5's reactive runtime.

---

## File Breakdown

### [`audioState.svelte.ts`](audioState.svelte.ts)
Global reactive audio state powered by Svelte 5 runes:
- **`audioState`**: `$state` object containing:
  - `context`: Active `AudioContext` instance (or `null` if stopped).
  - `masterNode`: Faust master mixer node (`master_mixer.dsp`).
  - `preMasterNode`: Main summing router node before master output.
  - `destinationNode`: Routed wrapper around `context.destination`.
  - `loadingCount`: Count of in-flight WASM/worklet initialization tasks.
- **`audioLoadingState`**: Helper with `isLoading`, `increment()`, and `decrement()` to coordinate loading spinners and gate audio playback until worklets are compiled.

### [`audioContextManager.ts`](audioContextManager.ts)
Low-level `AudioContext` lifecycle singleton:
- **`getAudioContext()`**: Returns a `Promise<AudioContext>` that resolves once the user interacts with the page and the context enters `'running'` state.
- **`startAudioContext()`**: Creates or resumes the `AudioContext` upon user interaction.
- **`closeAudioContext()`**: Closes the active context, clears all nodes from `audioState`, and synchronously resets the context promise for the next start.

### [`AudioContextManager.svelte`](AudioContextManager.svelte)
Top-bar UI button component for starting and stopping the audio engine:
- Toggles between "Start Audio" and "Stop Audio".
- Displays an animated loading spinner while Faust worklets are compiling.

### [`RoutedAudioNode.ts`](RoutedAudioNode.ts)
Base wrapper around native Web Audio `AudioNode`s:
- Tracks inbound (`inputs`) and outbound (`outputs`) node connections.
- Provides `connect(outputNode)`, `disconnect(outputNode)`, `disconnectAll()`, and `destroy()`.
- Enables visual routing representations (such as `RoutingGraph.svelte`) by keeping an in-memory graph of all active connections.

### [`RouterNode.ts`](RouterNode.ts)
Subclass of `RoutedAudioNode` that acts as a virtual pass-through junction:
- Has no audio processing of its own; instead, whenever an input connects to it, it connects that input directly to all registered outputs.
- Used extensively for `preMasterNode` so demonstration synths can connect without needing a reference to the master mixer's underlying Faust worklet.

### [`FaustNode.ts`](FaustNode.ts)
Subclass of `RoutedAudioNode<FaustAudioWorkletNode>` interfacing with `@grame/faustwasm`:
- **`FaustNode.create(name, context)`**: Asynchronously compiles/loads the named Faust DSP worklet, registers it with `audioLoadingState`, and returns a `FaustNode` instance.
- **`setParamValue(param, value)`**: Sends parameter updates to the Faust worklet by formatting the full address path (`/<dsp-name>/<param>`).
- **`getParamValue(param)`**: Queries the current value of a Faust DSP parameter.
- **`destroy()`**: Disconnects audio routing and cleans up worklet resources.

### [`useFaustNode.svelte.ts`](useFaustNode.svelte.ts)
Svelte 5 composable rune for easy Faust node usage inside components:
- Encapsulates async context acquisition, worklet creation, unmount cleanup, and race conditions.
- Automatically connects to an output node via a dynamic getter: `useFaustNode('dspName', () => outputNode)`.
- Exposes `faust.current` (reactive getter) and `faust.setParam(name, value)` with automatic `boolean` $\to$ `0 | 1` normalization.

### [`useAudioAnalyser.svelte.ts`](useAudioAnalyser.svelte.ts)
Svelte 5 composable rune for audio visualizers (`Scope.svelte`, `Frequency.svelte`):
- Connects an `AnalyserNode` wrapped in `RoutedAudioNode` to any dynamic input node.
- Manages buffer allocation (`dataArray`) and automatic disconnects on unmount or input changes.
- Provides `getTimeDomainData()` and `getFrequencyData()` helper methods.

---

## Architecture Flow

```
[ Synth / Oscillator Component ]
            │ (useFaustNode)
            ▼
       [ FaustNode ]
            │
            ▼
     [ preMasterNode ] (RouterNode)
            │
            ▼
      [ masterNode ] (FaustNode - master_mixer)
            │
            ▼
    [ destinationNode ] (AudioDestinationNode)
            │
            ▼
       [ Speakers ]
```
