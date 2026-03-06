<script lang="ts">
    import { FaustNode } from './FaustNode.ts';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { output = null }: { output?: FaustAudioWorkletNode | AudioNode | null } = $props();

    let faustNode = new FaustNode("saw_selector");

    let aliasing = $state(false);

    function handleAliasingChange() {
        faustNode.setParamValue("Aliasing", aliasing ? 1 : 0);
    }

    $effect(() => {
        faustNode.setOutput(output);
    });

    $effect(() => {
        handleAliasingChange();
    });

    $effect(() => {
        faustNode.start();
        return () => faustNode.destroy();
    });
</script>

<div style="margin-top: 1rem;">
    <label>
        <input type="checkbox" onchange={handleAliasingChange} bind:checked={aliasing} />
        Aliasing
    </label>
</div>
