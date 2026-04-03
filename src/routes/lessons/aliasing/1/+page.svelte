
<script lang="ts">
    import AliasingChart from '$lib/uiComponents/AliasingChart.svelte';
    import HSlider from '$lib/uiComponents/HSlider.svelte';
    import VSplitDiv from '$lib/uiComponents/VSplitDiv.svelte';

    let frequency: number = $state(2);
    let sampleRate: number = $state(10);

</script>

<VSplitDiv leftSide={leftSide} rightSide={rightSide} />

{#snippet leftSide()}
    <h1>Sampling</h1>
    <p>
        Check out <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Sampling_(signal_processing)">sampling</a>. 
        Here's some words that will teach you later.
        <br>
        Change the Frequency:
        <HSlider min={0} max={10} step={0.05} bind:value={frequency}>Frequency</HSlider>
        <br>
        Change the Sample Rate:
        <HSlider min={1} max={20} step={0.05} bind:value={sampleRate}>Sample Rate</HSlider>
    </p>
    <p>
        Now you know everything about aliasing so take the quiz:
        <a href="/lessons/aliasing/2">Continue</a>
    </p>

{/snippet}

{#snippet rightSide()}
    <AliasingChart frequency={frequency} sampleRate={sampleRate} />
{/snippet}