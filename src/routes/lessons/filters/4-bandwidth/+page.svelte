<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";

    let lineData = $state<{ f: number, value: number }[]>([]);
</script>

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /></AudioOverlay>

{#snippet leftSide()}
    <h1>Filter Bandwidth</h1>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} />
{/snippet}
