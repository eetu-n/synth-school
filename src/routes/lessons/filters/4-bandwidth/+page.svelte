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
    <h1>Filter Slope</h1>
    <p>
        Many digital filters will give you an option to affect the slope of the transition band, or to the same effect, the width.
        The simplest form is an option to select between some distinct options given in decibels per octave, or dB/oct.
        More advanced filters or graphical EQs might give you a continuous slider for this option.
    </p>
    <p>
        You might notice in this implementation, the peak before the transition band becomes larger when the transition band narrows.
        [TODO: Too detailed?]
    </p>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} />
{/snippet}
