<script lang="ts">
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import RouterNode from "$lib/audioFramework/RouterNode";
    import AudioOverlay from "$lib/uiComponents/AudioOverlay.svelte";
    import Scope from "$lib/analyzerComponents/Scope.svelte";
    import ResponsiveText from "$lib/uiComponents/ResponsiveText.svelte";
    import Frequency from "$lib/analyzerComponents/Frequency.svelte";
    import SinSynth from "$lib/audioComponents/SinSynth.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/oscillators/1" />

{#snippet leftSide()}
    <h1>Sine wave oscillator</h1>
    <p>
        The sine wave is, in a way, the simplest sound.
        It is sound energy at only a single frequency, where all other sounds have energy at multiple different frequencies.
        <br/><br/>
        <ResponsiveText mobileText="In the other pane" desktopText="On the right" /> there is a spectrogram, a graph that shows sound energy at different frequencies in real time.

    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <SinSynth outputNode={audioState.preMasterNode as RouterNode} />
        <Scope inputNode={audioState.preMasterNode as RouterNode} />
        <Frequency inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
