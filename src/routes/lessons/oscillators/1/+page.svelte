<script lang="ts">
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import SynthExamples from "$lib/audioComponents/SynthExamples.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import RouterNode from "$lib/audioFramework/RouterNode";
    import AudioOverlay from "$lib/uiComponents/AudioOverlay.svelte";
    import Scope from "$lib/analyzerComponents/Scope.svelte";
    import ResponsiveText from "$lib/uiComponents/ResponsiveText.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} next="/lessons/oscillators/2" />

{#snippet leftSide()}
    <h1>Oscillators</h1>
    <p>
        Oscillators, in the context of synthesis, are the components of a synthesizer that create an oscillating signal.
        <br/><br/>
        This can be a simple sine wave, or a more complicated signal like a triangle or square wave.
        <ResponsiveText mobileText="In the other pane" desktopText="On the right"/>, you can hear some examples, and the scope view should explain where they get their names. 
    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <SynthExamples outputNode={audioState.preMasterNode as RouterNode} />
        <Scope inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
