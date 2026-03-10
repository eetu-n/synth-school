import { audioState } from './audioState.svelte';

let audioContext: AudioContext | null = null;

let resolveAudioContext: (value: AudioContext) => void;
let rejectAudioContext: (reason?: any) => void;
let audioContextPromise = new Promise<AudioContext>((resolve, reject) => {
	resolveAudioContext = resolve;
	rejectAudioContext = reject;
});

export function getAudioContext(): Promise<AudioContext> {
	return audioContextPromise;
}

export function startAudioContext(): AudioContext {
	if (audioContext?.state === 'running') {
		resolveAudioContext(audioContext);
		return audioContext;
	}

	if (!audioContext || audioContext.state === 'closed') {
		audioContext = new AudioContext();
		audioState.context = audioContext;
		audioContext.addEventListener('statechange', () => {
			if (audioContext?.state === 'running') {
				resolveAudioContext(audioContext);
			}
		});
	}

	if (audioContext.state === 'suspended') {
		audioContext.resume().catch(rejectAudioContext);
	}

	return audioContext;
}

export function closeAudioContext() {
	if (!audioContext || audioContext.state === 'closed') return;
	audioContext
		.close()
		.then(() => {
			audioContext = null;
			audioState.context = null;
			// Reset promise for the next start
			audioContextPromise = new Promise<AudioContext>((resolve, reject) => {
				resolveAudioContext = resolve;
				rejectAudioContext = reject;
			});
		})
		.catch(console.error);
}

