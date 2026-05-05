<script lang="ts">
    import { audioState } from "$lib/audio/framework/audioState.svelte";
    import RouterNode from "$lib/audio/framework/RouterNode";
    import AudioOverlay from "$lib/components/ui/layout/AudioOverlay.svelte";
    import SynthMatchQuiz from "$lib/components/ui/layout/SynthMatchQuiz.svelte";

</script>

<AudioOverlay>
    <SynthMatchQuiz outputNode={audioState.preMasterNode as RouterNode}
        frequency={440}
    />
</AudioOverlay>