<script lang="ts">
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';
    import FaustNode from './FaustNode.svelte';

    let faustNode: FaustAudioWorkletNode | null;
    let faustNodeComponent: FaustNode;

    let aliasing = $state(false);
    let mute = $state(false);

    function handleAliasingChange() {
        if (faustNode) {
            faustNode.setParamValue("/saw_selector/Aliasing", aliasing ? 1 : 0);
        }
    }

    function handleMuteChange() {
        if (faustNode) {
            faustNode.setParamValue("/saw_selector/Mute", mute ? 1 : 0);
        }
    }

    $effect(() => {
        if (faustNode) {
            handleAliasingChange();
            handleMuteChange();
        }
    });
</script>

<FaustNode 
    name="saw_selector"
    bind:node={faustNode}
    bind:this={faustNodeComponent}
    let:loading
    let:started
    let:error
    let:start
>
    <main>
        <h1>Faust Saw Selector</h1>

        <button onclick={start} disabled={started || loading}>
            {#if loading}
                Loading...
            {:else if started}
                Audio Running
            {:else}
                Start Audio
            {/if}
        </button>

        {#if error}
            <p style="color: red;">Error: {error}</p>
        {/if}

        <div style="margin-top: 1rem;">
            <label>
                <input type="checkbox" onchange={handleAliasingChange} bind:checked={aliasing} />
                Aliasing
            </label>
            <label style="margin-left: 1rem;">
                <input type="checkbox" onchange={handleMuteChange} bind:checked={mute} />
                Mute
            </label>
        </div>
    </main>
</FaustNode>

<style>
    main {
        font-family: sans-serif;
        text-align: center;
    }
</style>
