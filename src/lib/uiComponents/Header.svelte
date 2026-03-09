<script lang="ts">
	import AudioContextManager from '$lib/audioFramework/AudioContextManager.svelte';
	import FaustMasterMixer from '$lib/audioComponents/FaustMasterMixer.svelte';
	import { audioState } from '$lib/audioFramework/audioState.svelte';
</script>

<header class="site-header">
	<div class="header-content">
		<AudioContextManager />
		<FaustMasterMixer bind:worklet={audioState.masterWorklet} />
	</div>
</header>

<style>
	.site-header {
		background-color: #f3f4f6;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		margin-bottom: 2rem;
		border-radius: 0 0 8px 8px;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
</style>
