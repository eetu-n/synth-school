<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} audioOverlay="right" />

{#snippet leftSide()}
    <h1>Decay</h1>
    <p>
        The decay of a sound is how quickly it moves from the loudest part to the sustain level.
        A short decay (again with a short attack) can sound percussive, whereas a longer decay usually sounds softer.
        <br/>
        Many acoustic instruments are slightly more difficult to describe by 
    </p>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} />
{/snippet}
