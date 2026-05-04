<!-- Module to start / stop the audio engine with a button -->

<script lang="ts">
	import { audioState, audioLoadingState } from '$lib/audio/framework/audioState.svelte';
	import { startAudioContext, closeAudioContext, getAudioContext } from '$lib/audio/framework/audioContextManager';

	let internalLoading = $state(false);
	let error = $state<string | null>(null);

    // Consider both the internal context creation and any pending nodes
    let loading = $derived(internalLoading || audioLoadingState.isLoading);

	$effect(() => {
		return () => {
			if (audioState.context && audioState.context.state === 'running') {
				closeAudioContext();
			}
		};
	});

	async function handleStart() {
		if (internalLoading) return;

		internalLoading = true;
		error = null;

		startAudioContext();

		try {
			await getAudioContext();
		} catch (e: any) {
			error = e.message;
		} finally {
			internalLoading = false;
		}
	}

	function handleStop() {
		closeAudioContext();
	}
</script>

<button 
	onclick={audioState.context ? handleStop : handleStart} 
	disabled={loading}
	class="bg-primary hover:bg-primary-variant disabled:bg-gray-600 text-white font-semibold py-2 px-3 sm:px-6 rounded transition-all text-xs sm:text-sm tracking-wider whitespace-nowrap flex items-center justify-center gap-2 min-w-[120px]"
>
	{#if loading}
		<div class="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
		<span>Starting...</span>
	{:else if audioState.context}
		Stop Audio
	{:else}
		Start Audio
	{/if}
</button>

{#if error}
	<p class="text-red-500">{error}</p>
{/if}
