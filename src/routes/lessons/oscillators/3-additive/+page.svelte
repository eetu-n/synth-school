<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Scope from "$lib/components/ui/viz/Scope.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import AdditiveSaw from "$lib/components/audio/AdditiveSaw.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} />

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
