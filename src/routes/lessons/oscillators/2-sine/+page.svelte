<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Scope from "$lib/components/ui/viz/Scope.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import SinSynth from "$lib/components/audio/SinSynth.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} />

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
