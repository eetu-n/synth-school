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

<VSplitDiv {leftSide} {rightSide} prev="/lessons/oscillators/1" next="/lessons/oscillators/3"/>

{#snippet leftSide()}
    <h1>Sine wave oscillator</h1>
    <p>
        The sine wave is, in a way, the simplest sound.
        It is sound energy at only a single frequency, where all other sounds have energy at multiple different frequencies.
        <br/><br/>
        <ResponsiveText mobileText="In the other pane" desktopText="On the right" /> there is a spectrogram, a graph that shows sound energy at different frequencies in real time.
        You should be able to see the tall individual peak corresponding to the frequency of the played sine wave, with perhaps some smaller slopes around it.
        These slopes are not actually there, but come as an artifact due to how the spectrogram is calculated.

    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <SinSynth outputNode={audioState.preMasterNode as RouterNode} />
        <!-- <Scope inputNode={audioState.preMasterNode as RouterNode} /> -->
        <Frequency inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
