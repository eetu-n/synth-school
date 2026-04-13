<script lang="ts">
import AliasingChart from "$lib/uiComponents/AliasingChart.svelte";
import HSlider from "$lib/uiComponents/HSlider.svelte";
import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
import Katex from "$lib/uiComponents/Katex.svelte"

let frequency: number = $state(2);
let sampleRate: number = $state(10);
let showOriginal: boolean = $state(true);
</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/aliasing/2"/>

{#snippet leftSide()}
    <h1>Aliasing</h1>
    <p>
        Here you can change both the frequency as well as the sample rate on the graph in the other pane.
        Get a feel for how the two interact.
        <br/><br/>
        As you can see, increasing the frequency past the Nyquist freqency causes it to move in the opposite direction. 
        So the original frequency 
        <Katex math={String.raw`\tooltip{f_o}{Original frequency} = \tooltip{f_n}{Nyquist frequency} + 5`}/> 
        becomes
        <Katex math={String.raw`\tooltip{f_a}{Aliased frequency} = f_n - 5`}/>.
        <br/><br/>

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
    <HSlider min={0} max={20} step={0.05} width="100%" bind:value={frequency}>Frequency</HSlider>
    <br />
    Change the sample rate:
    <br />
    <HSlider min={1} max={20} step={0.05} width="100%" bind:value={sampleRate}>Sample Rate</HSlider>
    <br />
{/snippet}
