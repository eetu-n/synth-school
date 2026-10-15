<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import Noise from "$lib/components/audio/Noise.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import type FaustNode from "$lib/audio/framework/FaustNode";
    import type { BandRegion } from "$lib/audio/nodes/FilterResponseAnalyzer";

    let lineData = $state<{ f: number, value: number }[]>([]);
    let bandRegions = $state<BandRegion[]>([]);
    let noiseNode = $state<FaustNode | null>(null);
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
    <Noise bind:noiseNode />
    <FilterDemo inputNode={noiseNode} outputNode={audioState.preMasterNode as RouterNode} enableCutoff={true} enableSlope={true} showBands={true} bind:bandRegions bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} {bandRegions} />
{/snippet}
