<script lang="ts">
    import AliasingChart from "$lib/components/ui/viz/AliasingChart.svelte";
    import HSlider from "$lib/components/ui/inputs/HSlider.svelte";
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import Toggle from "$lib/components/ui/inputs/Toggle.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";

    let frequency: number = $state(2);
    let sampleRate: number = $state(10);
    let showOriginal: boolean = $state(true);
</script>

<VSplitDiv {leftSide} {rightSide} next="/lessons/aliasing/2" />

{#snippet leftSide()}
    <h1>Sampling</h1>
    <p>
        If we want to represent a continuous signal (such as sound) in a computer, one way to do it is <a href="https://en.wikipedia.org/wiki/Sampling_(signal_processing)">sampling</a>.
        This is the process of measuring the value (air pressure for sound) at specific times, often at a regular interval.
        This interval is called the <i>sampling frequency</i> or <i>sample rate</i>.
        <br/>
        In practice, if the sample rate is high enough, we can perfectly reconstruct the original signal.
        You can see this intuitively on the chart <ResponsiveText mobileText="in the workspace tab" desktopText="on the right" />; you can still easily see the shape of the original signal even if you toggle its visibility.
        <br/>
        <br/>
        Note: the example signals here are all simple sine waves, but this applies to more complex signals as well.
    </p>
{/snippet}

{#snippet rightSide()}
    <AliasingChart {frequency} sampleRate={20} showAliased={false} showSamples={true} showOriginal={showOriginal} showValues={false}/>

    Display Original:
    <Toggle bind:checked={showOriginal} colored={true}/>
    <br />
    <br />

    Change the Frequency:
    <br />
    <HSlider min={1} max={5} step={0.05} width="100%" bind:value={frequency}
        >Frequency</HSlider
    >
    <br />
{/snippet}
