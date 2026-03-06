<script lang="ts">
    import FaustNode from './FaustNode.svelte';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { output = null }: { output?: FaustAudioWorkletNode | AudioNode | null } = $props();

    let faustNode: FaustNode | null = null;
    
    let freq = $state(0);

    $effect(() => {
        let frame: number;
        
        const loop = () => {
            if (faustNode) {
                // The parameter is named 'key' in midi_test.dsp
                const val = faustNode.getParamValue('freq');
                if (val !== freq) {
                    freq = val;
                }
            }
            frame = requestAnimationFrame(loop);
        };
        
        frame = requestAnimationFrame(loop);
        
        return () => cancelAnimationFrame(frame);
    });
</script>

<p>Current MIDI Key: {freq}</p>

<FaustNode 
    name="midi_test"
    bind:this={faustNode}
    output={output}
/>
