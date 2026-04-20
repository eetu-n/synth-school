<script lang="ts">
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import ResponsiveText from "$lib/uiComponents/ResponsiveText.svelte";
    import SynthExamples from "$lib/audioComponents/SynthExamples.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import RouterNode from "$lib/audioFramework/RouterNode";
    import AudioOverlay from "$lib/uiComponents/AudioOverlay.svelte";
    import RoutingGraph from "$lib/uiComponents/RoutingGraph.svelte";
    import Scope from "$lib/analyzerComponents/Scope.svelte";
    import Frequency from "$lib/analyzerComponents/Frequency.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} next="/lessons/oscillators/2" />

{#snippet leftSide()}
    <h1>Oscillators</h1>
    <p>
        Oscillators, in the context of synthesis, are the components of a synthesizer that create an oscillating signal.
        This can be a simple sine wave, or a more complicated signal like a triangle or square wave.
    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <div class="centered"><SynthExamples outputNode={audioState.preMasterNode as RouterNode} /></div>
        <Scope inputNode={audioState.preMasterNode as RouterNode} />
        <Frequency inputNode={audioState.preMasterNode as RouterNode} />
    </AudioOverlay>
{/snippet}
