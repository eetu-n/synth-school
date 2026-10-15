<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import Noise from "$lib/components/audio/Noise.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import type FaustNode from "$lib/audio/framework/FaustNode";

    let lineData = $state<{ f: number, value: number }[]>([]);
    let noiseNode = $state<FaustNode | null>(null);
</script>

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /> </AudioOverlay>

{#snippet leftSide()}
    <h1>Filter Quality</h1>
    <p>
        The <i>quality</i>, <i>Q</i>, or <i>resonance</i> of a filter affects the size of the bump before the transition band; a higher Q means a larger bump.
        Sometimes, the Q value might also affect the size of the transition band directly, though this is not necessarily technically accurate.
    </p>
    [TODO: Acid bass?]
{/snippet}

{#snippet rightSide()}
    <Noise bind:noiseNode />
    <FilterDemo inputNode={noiseNode} outputNode={audioState.preMasterNode as RouterNode} enableCutoff={true} enableSlope={true} enableResonance={true} bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} />
{/snippet}
