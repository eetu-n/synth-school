<script lang="ts">
    import { FaustNode } from '$lib/audioFramework/FaustNode';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';
    import Toggle from '$lib/uiComponents/Toggle.svelte';

    let { output = null, isRightAliasing = true }: { output?: FaustAudioWorkletNode | AudioNode | null, isRightAliasing?: boolean } = $props();

    let faustNode = new FaustNode("saw_selector");

    let isRightSelected = $state(false);

    function handleAliasingChange() {
        faustNode.setParamValue("Aliasing", Number(!isRightAliasing) ^ Number(isRightSelected));
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
    A
    <Toggle onchange={handleAliasingChange} bind:checked={isRightSelected} />
    B
</div>
