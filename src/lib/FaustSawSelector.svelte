<script lang="ts">
    import FaustNode from './FaustNode.svelte';

    let faustNode: FaustNode | null = null;

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
    bind:this={faustNode}
/>

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
