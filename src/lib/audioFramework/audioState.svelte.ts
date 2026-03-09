import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

export const audioState = $state({
    masterWorklet: null as FaustAudioWorkletNode | null
});
