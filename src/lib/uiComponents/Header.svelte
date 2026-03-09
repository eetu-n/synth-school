<script lang="ts">
	import AudioContextManager from '$lib/audioFramework/AudioContextManager.svelte';
	import FaustMasterMixer from '$lib/audioComponents/FaustMasterMixer.svelte';
	import { audioState } from '$lib/audioFramework/audioState.svelte';
</script>

<header>
	<div style="display: flex; align-items: center; gap: 1rem;">
		<AudioContextManager />
		<FaustMasterMixer bind:worklet={audioState.masterWorklet} />
	</div>
</header>
