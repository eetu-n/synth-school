<script lang="ts">
    import AliasingChart from "$lib/uiComponents/AliasingChart.svelte";
    import HSlider from "$lib/uiComponents/HSlider.svelte";
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import Toggle from "$lib/uiComponents/Toggle.svelte";
    import LessonNavigation from "$lib/uiComponents/LessonNavigation.svelte";

    let frequency: number = $state(2);
    let sampleRate: number = $state(10);
    let showOriginal: boolean = $state(true);
</script>

<VSplitDiv {leftSide} {rightSide} />

{#snippet leftSide()}
    <h1>Sampling</h1>
    <p></p>

    <LessonNavigation prev="/lessons/aliasing/2" />
{/snippet}

{#snippet rightSide()}
    <AliasingChart
        {frequency}
        {sampleRate}
        showAliased={true}
        showSamples={true}
        showOriginal={true}
        showValues={true}
    />

    Change the frequency:
    <br />
    <HSlider min={0} max={20} step={0.05} width="100%" bind:value={frequency}>Frequency</HSlider>
    <br />
    Change the sample rate:
    <br />
    <HSlider min={1} max={20} step={0.05} width="100%" bind:value={sampleRate}>Sample Rate</HSlider>
    <br />
{/snippet}
