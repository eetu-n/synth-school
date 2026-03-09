<script lang="ts">
    import { FaustNode } from '$lib/audioFramework/FaustNode';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { output = null }: { output?: FaustAudioWorkletNode | AudioNode | null } = $props();

    let faustNode = new FaustNode("midi_test");
    
    let freq = $state(0);

    $effect(() => {
        faustNode.setOutput(output);
    });

    $effect(() => {
        faustNode.start();
        
        let frame: number;
        
        const loop = () => {
            // The parameter is named 'key' in midi_test.dsp
            const val = faustNode.getParamValue('freq');
            if (val !== freq) {
                freq = val;
            }
            frame = requestAnimationFrame(loop);
        };
        
        frame = requestAnimationFrame(loop);
        
        return () => {
            cancelAnimationFrame(frame);
            faustNode.destroy();
        };
    });
</script>

<p>Current MIDI Key: {freq}</p>
