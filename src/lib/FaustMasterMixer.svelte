<script lang="ts">
    import { FaustNode } from './FaustNode.ts';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { worklet = $bindable() }: { worklet?: FaustAudioWorkletNode | null } = $props();

    let faustNode = new FaustNode("master_mixer");

    let gain = $state(0.9);
    let mute = $state(false);

    function handleMuteChange() {
        faustNode.setParamValue("Mute", mute ? 1 : 0);
    }

    function handleGainChange() {
        faustNode.setParamValue("Gain", gain);
    }

    $effect(() => {
        handleMuteChange();
    });

    $effect(() => {
        faustNode.start().then(() => {
            worklet = faustNode.worklet;
        });
        return () => faustNode.destroy();
    });
</script>

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
