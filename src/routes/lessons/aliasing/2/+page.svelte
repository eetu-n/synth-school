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
    <p>
        However, if the frequency of the signal you're trying to recreate gets too high, then recreating the signal becomes difficult.
        <br/>
        For instance, both signal A and B on the other pane line up with the sampled points, but clearly Signal A is more natural to assume, if given only the samples.
        <br/>
        In fact, it is mathematically impossible to construct a signal past a certain frequency threshold because of this reason.
        This threshold frequency is known as the <i>Nyquist frequency</i>, and its value is the sample rate divided by 2.
    </p>

    <LessonNavigation prev="/lessons/aliasing/1" next="/lessons/aliasing/3" />
{/snippet}

{#snippet rightSide()}
    <AliasingChart frequency={7.5} sampleRate={10} showAliased={!showOriginal} showSamples={true} showOriginal={showOriginal} showLabels={false} showAxisLabels={false}/>

    Signal A <Toggle bind:checked={showOriginal} colored={false}/> Signal B
    <br />
    <br />
{/snippet}
