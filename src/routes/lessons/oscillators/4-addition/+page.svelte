<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Scope from "$lib/components/ui/viz/Scope.svelte";
    import ResponsiveText from "$lib/components/ui/text/ResponsiveText.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
    import AdditiveSaw from "$lib/components/audio/AdditiveSaw.svelte";
    import SignalAddition from "$lib/components/ui/viz/SignalAddition.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} next="/lessons/oscillators/5/a" />

{#snippet leftSide()}
    <h1>Signal Addition</h1>
    <p>
        Adding two signals is as simple as adding each individual sample.
        <ResponsiveText mobileText="In the other pane" desktopText="On the right"/>, you can see an example of two sines being added together.
    </p>
{/snippet}

{#snippet rightSide()}
    <SignalAddition />
{/snippet}
