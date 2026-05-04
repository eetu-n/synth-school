<script lang="ts">
    import { audioState } from '$lib/audio/framework/audioState.svelte';
    import FaustNode from '$lib/audio/framework/FaustNode';
    import type RoutedAudioNode from '$lib/audio/framework/RoutedAudioNode';

    let { output = null }: { output?: RoutedAudioNode | null } = $props();

    let faustNode = await FaustNode.create("midi_test", audioState.context as AudioContext );
    
    let freq = $state(0);

    $effect(() => {
        if (!faustNode || !output) return;
        faustNode.connect(output);
    });

    $effect(() => {
        return () => {
            faustNode?.destroy();
        };
    });
</script>
