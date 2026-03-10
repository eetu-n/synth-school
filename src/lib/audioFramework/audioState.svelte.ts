import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

export const audioState = $state({
    context: null as AudioContext | null,
    masterWorklet: null as FaustAudioWorkletNode | null
});
