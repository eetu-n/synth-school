<script lang="ts">
    import { audioState } from '$lib/audio/framework/audioState.svelte';
    import RouterNode from '$lib/audio/framework/RouterNode';
    import MockResample from "$lib/components/audio/MockResample.svelte";
    import AliasingChart from "$lib/components/ui/viz/AliasingChart.svelte";
    import HSlider from "$lib/components/ui/inputs/HSlider.svelte";
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import Toggle from '$lib/components/ui/inputs/Toggle.svelte';
    import AudioOverlay from '$lib/components/ui/layout/AudioOverlay.svelte';

    let frequency:      number  = $state(1000);
    let sampleRate:     number  = $state(2500);
    let nyquist:        number  = $derived(sampleRate / 2);

    let play:           boolean = $state(false);

</script>

<VSplitDiv {leftSide} {rightSide} />

{#snippet leftSide()}
    <h1>How does it sound?</h1>
    <p>
        Here you can listen to the effect with a single sine wave, such as in the previous examples.
        Note that the effect here is simulated; getting a clean single aliased sound without artifacts is somewhat complicated.
    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <MockResample {frequency} {sampleRate} {play} outputNode={audioState.preMasterNode as RouterNode} />

        <AliasingChart
            {frequency}
            {sampleRate}
            showAliased={true}
            showSamples={true}
            showOriginal={true}
            showValues={true}
            duration={0.005}
        />

        <Toggle colored={true} bind:checked={play}>Play</Toggle>

        <br />

        Change the frequency:
        <br />
        <HSlider min={0} max={2000} step={1} width="100%" bind:value={frequency}>Frequency</HSlider>
        <br /><br />
        Change the sample rate:
        <br />
        <HSlider min={1} max={4000} step={1} width="100%" bind:value={sampleRate}>Sample Rate</HSlider>
        <br />
    </AudioOverlay>
{/snippet}
