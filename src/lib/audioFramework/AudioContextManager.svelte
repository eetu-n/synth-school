<!-- Module to start / stop the audio engine with a button -->

<script lang="ts">
	import { audioState } from '$lib/audioFramework/audioState.svelte';
	import { startAudioContext, closeAudioContext, getAudioContext } from '$lib/audioFramework/audioContextManager';

	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		return () => {
			if (audioState.context && audioState.context.state === 'running') {
				closeAudioContext();
			}
		};
	});

	async function handleStart() {
		if (loading) return;

		loading = true;
		error = null;

		startAudioContext();

		try {
			await getAudioContext();
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function handleStop() {
		closeAudioContext();
	}
</script>

<button 
	onclick={audioState.context ? handleStop : handleStart} 
	disabled={loading}
	class="bg-primary hover:bg-primary-variant text-white font-semibold py-2 px-3 sm:px-6 rounded transition-colors text-xs sm:text-sm tracking-wider whitespace-nowrap"
>
	{#if loading}
		Loading...
	{:else if audioState.context}
		Stop Audio
	{:else}
		Start Audio
	{/if}
</button>

{#if error}
	<p class="text-red-500">{error}</p>
{/if}
