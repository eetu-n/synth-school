<script lang="ts">
    import FaustNode from './FaustNode.svelte';

    let faustNode: FaustNode | null = null;

    let aliasing = $state(false);

    function handleAliasingChange() {
        if (faustNode) {
            faustNode.setParamValue("Aliasing", aliasing ? 1 : 0);
        }
    }

    $effect(() => {
        if (faustNode) {
            handleAliasingChange();
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
</div>
