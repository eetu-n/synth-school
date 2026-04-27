<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import RouterNode from '$lib/audioFramework/RouterNode';
    import MockResample from "$lib/audioComponents/MockResample.svelte";
    import AliasingChart from "$lib/uiComponents/AliasingChart.svelte";
    import HSlider from "$lib/uiComponents/HSlider.svelte";
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import Toggle from '$lib/uiComponents/Toggle.svelte';
    import AudioOverlay from '$lib/uiComponents/AudioOverlay.svelte';

    let frequency:      number  = $state(1000);
    let sampleRate:     number  = $state(2500);
    let nyquist:        number  = $derived(sampleRate / 2);

    let play:           boolean = $state(false);

</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/aliasing/4" />

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
