<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";

    let lineData = $state<{ f: number, value: number }[]>([]);
    let bandRegions = $state<{ startF: number, endF: number, label: string, color?: string }[]>([]);
</script>

<AudioOverlay> <VSplitDiv {leftSide} {rightSide} /></AudioOverlay>

{#snippet leftSide()}
    <h1>Filter Bands</h1>
    <p>
        Generally, a filter can be described as having three distinct regions or <i>bands</i>.
        These are:
    </p>
        <ul>
            <li><b>Passband</b>: where ideally the filter has no effect on the sound.</li>
            <li><b>Stopband</b>: where ideally the filter silences all sound.</li>
            <li><b>Transition Band</b>: which is where the filter smoothly transitions between the two.</li>
        </ul>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} enableCutoff={true} enableSlope={true} bind:lineData showBands={true} bind:bandRegions  />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} {bandRegions} />
{/snippet}
