<script lang="ts">
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import SynthMatchQuiz from "$lib/components/ui/layout/SynthMatchQuiz.svelte";

</script>

<AudioOverlay>
    <SynthMatchQuiz outputNode={audioState.preMasterNode as RouterNode}
        waveform={0}
        frequency={440}
        cutoff={2000}
        resonance={1.0}
        attack={10}
        decay={100}
        sustain={0.7}
        release={200}
    />
</AudioOverlay>