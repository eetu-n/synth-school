<script lang="ts">
    import AliasingChart from "$lib/uiComponents/AliasingChart.svelte";
    import HSlider from "$lib/uiComponents/HSlider.svelte";
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import Katex from "$lib/uiComponents/Katex.svelte"

    let frequency:      number  = $state(7.5);
    let sampleRate:     number  = $state(10);
    let nyquist:        number  = $derived(sampleRate / 2);

    // Printable values
    let fo:             string  = $derived(frequency.toFixed(2));
    let fn:             string  = $derived(nyquist.toFixed(2));
    let fa:             string  = $derived((nyquist - Math.abs(nyquist - frequency)).toFixed(2));
    let diff:           string  = $derived(Math.abs(nyquist - frequency).toFixed(2));

    let showOriginal:   boolean = $state(true);
</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/aliasing/3"/>

{#snippet leftSide()}
    <h1>Aliasing</h1>
    <p>
        When the original frequency increases past the sampling frequency, the aliased frequency also switches directions and starts increasing as well.
        You might be able to notice that the phase of the signal also changes at this point. 
        <br/><br/>
        So:
        <br/>
        <Katex math={String.raw`\fo = {${fo}} = \fnv{${fn}} + {${diff}}`}/> 
        <br/>
        <br/>
        becomes:
        <br/>
        <Katex math={String.raw`\fav{${fa}} = {${fa}} = \fnv{${fn}} - {${diff}}`}/> 
    </p>
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
    <HSlider min={7.5} max={12.5} step={0.05} width="100%" bind:value={frequency}>Frequency</HSlider>
    <br />
{/snippet}
