<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} />

{#snippet leftSide()}
    <h1>Filters</h1>
    <p>
        Filters are processes that remove parts of a sound, or more generally, from a signal.
        The most common filters you'll encounter in music and sound design are low-pass, high-pass and band-pass filters.
    </p>
    <p>
        <b>High-pass filters</b> allow high frequencies to pass and remove or reduce low frequencies.
    </p>
    <p>
        <b>Low-pass filters</b> allow low frequencies to pass and remove or reduce high frequencies.
    </p>
    <p>
        <b>Band-pass filters</b> allow a specific band of frequencies to pass and remove others.
        They can be thought of as both a low-pass and high-pass filter applied to the same signal.
    </p>
    <br>
    <p>
        Some common parameters for filters are the <b>cutoff frequency</b>, <b>quality (Q)</b>, <b>bandwidth</b>, and <b>gain</b>.
        These are discussed in detail in the following sections.
    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <FilterDemo outputNode={audioState.preMasterNode as RouterNode} />
        <Frequency inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
