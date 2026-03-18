<script lang="ts">
    import { FaustNode } from "$lib/audioFramework/FaustNode";
    import type { FaustAudioWorkletNode } from "@grame/faustwasm/dist/esm/index.js";
    import HSlider from "$lib/uiComponents/HSlider.svelte";

    import mutedIcon from "$lib/assets/volume-xmark-solid-full.svg?raw";
    import volumeLowIcon from "$lib/assets/volume-low-solid-full.svg?raw";
    import volumeMidIcon from "$lib/assets/volume-solid-full.svg?raw";
    import volumeHighIcon from "$lib/assets/volume-high-solid-full.svg?raw";

    let { worklet = $bindable() }: { worklet?: FaustAudioWorkletNode | null } =
        $props();

    let faustNode = new FaustNode("master_mixer");

    let gain = $state(0.9);
    let mute = $state(false);

    function handleGainChange() {
        faustNode.setParamValue("Gain", gain);
        if (gain == 0) {
            mute = true;
        } else {
            mute = false;
        }
    }

    $effect(() => {
        faustNode.setParamValue("Mute", mute ? 1 : 0);
    });

    $effect(() => {
        faustNode.start().then(() => {
            worklet = faustNode.worklet;
        });
        return () => faustNode.destroy();
    });
</script>

<div style="display: flex; align-items: center;">
    <button
        class="mute-button"
        onclick={() => (mute = !mute)}
        style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem; padding: 0;"
    >
        {#if mute}
            {@html mutedIcon}
        {:else if gain < 0.2}
            {@html volumeLowIcon}
        {:else if gain > 0.8}
            {@html volumeHighIcon}
        {:else}
            {@html volumeMidIcon}
        {/if}
    </button>
    <HSlider oninput={handleGainChange} bind:value={gain} />
</div>

<style>
    .mute-button{
        width: 1.5em; 
        height: 1.5em;
        
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
    }
    .mute-button :global(svg) {
        width: auto;
        height: 1em;
        display: block;
    }
</style>
