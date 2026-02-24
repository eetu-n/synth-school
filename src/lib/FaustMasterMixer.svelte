<script lang="ts">
    import FaustNode from './FaustNode.svelte';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { worklet = $bindable() }: { worklet?: FaustAudioWorkletNode | null } = $props();

    let faustNode: FaustNode | null = null;

    let gain = $state(0.9);
    let mute = $state(false);

    function handleMuteChange() {
        if (faustNode) {
            faustNode.setParamValue("Mute", mute ? 1 : 0);
        }
    }

    function handleGainChange() {
        if (faustNode) {
            faustNode.setParamValue("Gain", gain);
        }
    }


    $effect(() => {
        if (faustNode) {
            handleMuteChange();
        }
    });
</script>

<FaustNode 
    name="master_mixer"
    bind:this={faustNode}
    bind:worklet={worklet}
/>

<div style="margin-top: 1rem;">
    <label style="margin-left: 1rem;">
        <input type="checkbox" onchange={handleMuteChange} bind:checked={mute} />
        Mute
    </label>
    <label>
        <input type="range" style="writing-mode:vertical-lr; direction: rtl; appearance: slider-vertical;" oninput={handleGainChange} min="0" max="1" step="0.01" bind:value={gain} />
        Gain
    </label>
</div>
