<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import Frequency from "$lib/components/ui/viz/Frequency.svelte";
</script>

<AudioOverlay><VSplitDiv {leftSide} {rightSide} /></AudioOverlay>

{#snippet leftSide()}
    <h1>Envelopes</h1>
    <p>
        Envelopes control the volume of a sound over time, relative to e.g. when a midi key is pressed.
    </p>
    <ul>
        <li><b>Attack</b> controls how quickly or slowly a sound gets to full volume. </li>
        <li><b>Decay</b> controls how quickly the sound reduces to the <b>sustain</b> volume. </li>
        <li><b>Sustain</b> is the level the sound is held at until the key is released. </li>
        <li><b>Release</b> controls how quickly the sound reduces from the sustain level to zero. </li>
    </ul>
    <p>
        So attack, decay, and release are all time variables, while sustain is a volume level.
        An envelope with these variables is often called an ADSR.
    </p>
{/snippet}

{#snippet rightSide()}
    <Frequency inputNode={audioState.preMasterNode as RouterNode} />
{/snippet}
