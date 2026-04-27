<script lang="ts">
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import RouterNode from "$lib/audioFramework/RouterNode";
    import AudioOverlay from "$lib/uiComponents/AudioOverlay.svelte";
    import Scope from "$lib/analyzerComponents/Scope.svelte";
    import ResponsiveText from "$lib/uiComponents/ResponsiveText.svelte";
    import Frequency from "$lib/analyzerComponents/Frequency.svelte";
    import AdditiveSaw from "$lib/audioComponents/AdditiveSaw.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/oscillators/2" />

{#snippet leftSide()}
    <h1>Adding more sines</h1>
    <p>
        What happens when we add more sines?
        The slider <ResponsiveText mobileText="in the other pane" desktopText="on the right"/> lets you add an increasing number of <a target="_blank" href="https://en.wikipedia.org/wiki/Harmonic">harmonics</a> on top of the first sine.
        
    </p>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <AdditiveSaw outputNode={audioState.preMasterNode as RouterNode} />
        <Scope inputNode={audioState.preMasterNode as RouterNode} />
        <!-- <Frequency inputNode={audioState.preMasterNode as RouterNode} /> -->
    </AudioOverlay>
{/snippet}
