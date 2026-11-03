<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import FilterDemo from "$lib/components/audio/FilterDemo.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";

</script>

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /></AudioOverlay>

{#snippet leftSide()}
    <h1>Attack</h1>
    <p>
        A longer attack makes the sound "start" slower.
        A shorter attack, especially accompanied by a short decay and low sustain, can make a sound start percussive, whereas a longer attack often sounds softer.
        <br/>
        A guitar or piano can typically thought of as having a "short" attack, whereas something like a slowly bowed violin has a longer attack.
    </p>
{/snippet}

{#snippet rightSide()}
    <FilterDemo outputNode={audioState.preMasterNode as RouterNode} />
{/snippet}
