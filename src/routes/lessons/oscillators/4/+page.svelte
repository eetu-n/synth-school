<script lang="ts">
    import VSplitDiv from "$lib/uiComponents/VSplitDiv.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import RouterNode from "$lib/audioFramework/RouterNode";
    import AudioOverlay from "$lib/uiComponents/AudioOverlay.svelte";
    import Scope from "$lib/analyzerComponents/Scope.svelte";
    import ResponsiveText from "$lib/uiComponents/ResponsiveText.svelte";
    import Frequency from "$lib/analyzerComponents/Frequency.svelte";
    import AdditiveSaw from "$lib/audioComponents/AdditiveSaw.svelte";
    import SignalAddition from "$lib/uiComponents/SignalAddition.svelte";

</script>

<VSplitDiv {leftSide} {rightSide} prev="/lessons/oscillators/3" next="/lessons/oscillators/5" />

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
