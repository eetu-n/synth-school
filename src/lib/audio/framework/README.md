# Audio Framework (`src/lib/audio/framework`)

Web Audio and Faust WebAssembly runtime infrastructure and graph topology management.

## Structure

- **Context & State**: `audioContextManager.ts` manages context lifecycle and browser autoplay unlocking; `audioState.svelte.ts` tracks active nodes and DSP compilation state.
- **Routing Graph**: `RoutedAudioNode.ts` tracks connection topology across Web Audio nodes; `RouterNode.ts` acts as a pass-through junction for fan-in/fan-out routing.
- **Faust Integration**: `FaustNode.ts` wraps Faust WebAssembly worklets; `useFaustNode.svelte.ts` and `useAudioAnalyser.svelte.ts` provide lifecycle runes for components and visualizers.

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
