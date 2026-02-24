<script lang="ts">
	import AudioContextManager from '$lib/AudioContextManager.svelte';
    import FaustMasterMixer from '$lib/FaustMasterMixer.svelte';
	import FaustSawSelector from '$lib/FaustSawSelector.svelte';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let masterWorklet: FaustAudioWorkletNode | null = $state(null);
</script>

<AudioContextManager />
<FaustMasterMixer bind:worklet={masterWorklet} />
<FaustSawSelector output={masterWorklet} />
