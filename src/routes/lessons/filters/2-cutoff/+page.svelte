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

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /> </AudioOverlay>

{#snippet leftSide()}
    <h1>Filter Cutoff Frequency</h1>
    <p>
        The cutoff frequency of a filter is the frequency that the filter begins acting at.
    </p>
    <p>
        For example, an ideal low-pass filter with a cutoff of 500Hz would allow all frequencies below 500Hz to pass, and remove all frequencies above 500Hz.
    </p>
    <p>
        However, as you can see, in practice, filters are most often not ideal, and have a <b>transition band</b>, where the signal is attenuated somewhat but not completely.
    </p>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} enableCutoff={true} bind:lineData />
    <Frequency inputNode={audioState.preMasterNode as RouterNode} {lineData} />
{/snippet}
