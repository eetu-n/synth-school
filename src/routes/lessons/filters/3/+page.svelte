<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/filters/2" next="/lessons/filters/4" />

{#snippet leftSide()}
    <h1>Filter Quality</h1>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <FilterDemo outputNode={audioState.preMasterNode as RouterNode} />
        <Frequency inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
