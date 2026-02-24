<!-- Module to start / stop the audio engine with a button -->

<script lang="ts">
	import { startAudioContext, closeAudioContext, getAudioContext } from './audioContextManager';

	let started = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let audioContext: AudioContext | null = null;

	$effect(() => {
		return () => {
			if (audioContext && audioContext.state === 'running') {
				closeAudioContext();
			}
		};
	});

	async function handleStart() {
		if (started || loading) return;

		loading = true;
		error = null;

		startAudioContext();

		try {
			audioContext = await getAudioContext();

			if (audioContext.state === 'running') {
				started = true;
			}

			audioContext.addEventListener('statechange', () => {
				if (audioContext?.state === 'closed') {
					started = false;
					audioContext = null;
				}
			});
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

<button onclick={started ? handleStop : handleStart} disabled={loading}>
	{#if loading}
		Loading...
	{:else if started}
		Stop Audio
	{:else}
		Start Audio
	{/if}
</button>

{#if error}
	<p style="color: red;">{error}</p>
{/if}
