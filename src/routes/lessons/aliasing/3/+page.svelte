<script lang="ts">
import AliasingChart from "$lib/uiComponents/AliasingChart.svelte";
import HSlider from "$lib/uiComponents/HSlider.svelte";
import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";

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
        As you can see, the aliased signal "folds" around the Nyquist frequency, in fact the Nyquist frequency is often known as the "folding frequency".
        
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
