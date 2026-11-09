<script lang="ts">
    import VSplitDiv from "$lib/components/ui/layout/VSplitDiv.svelte";
    import type FaustNode from "$lib/audio/framework/FaustNode";

    let noiseNode = $state<FaustNode | null>(null);
</script>

<VSplitDiv {leftSide} {rightSide} audioOverlay="neither"/>

{#snippet leftSide()}
    <h1>LFOs</h1>
    <p>
        Lfos, or Low Frequency Oscillators, is the name used for oscillators used in automation, not in creating sound.
        <br />
        For instance, vibrato in digital instruments is just an LFO affecting pitch. 
        <br />
        The most common parameters for an LFO are the <b>rate</b>, <b>depth</b>, and <b>shape</b>.
    </p>
{/snippet}

{#snippet rightSide()}
Ha haa
{/snippet}
