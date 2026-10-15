<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import SynthExamples from "$lib/components/audio/SynthExamples.svelte";
    import type FaustNode from "$lib/audio/framework/FaustNode";

    let lineData = $state<{ f: number, value: number }[]>([]);
    let synthNode = $state<FaustNode | null>(null);
</script>

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /> </AudioOverlay>

{#snippet leftSide()}
    <h1>With a synth</h1>
    <p>
        Here you can see how the filters affect the sound of the different oscillators you heard before.
        <i>Low pass filters</i> are very commonly applied especially to sawtooth synths, in order to soften the sound somewhat.
        <i>High pass filters</i> are less common, as the first thing they would cut out is the fundamental frequency being played.

    </p>
{/snippet}

{#snippet rightSide()}
    <SynthExamples bind:faustNode={synthNode} />
    <FilterDemo inputNode={synthNode} outputNode={audioState.preMasterNode as RouterNode} enableCutoff={true} enableSlope={true} enableResonance={true} bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} />
{/snippet}
