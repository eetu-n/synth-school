import { audioState } from './audioState.svelte';

let audioContext: AudioContext | null = null;

let resolveAudioContext: (value: AudioContext) => void;
let rejectAudioContext: (reason?: any) => void;
let audioContextPromise: Promise<AudioContext>;

function createNewPromise() {
    audioContextPromise = new Promise<AudioContext>((resolve, reject) => {
        resolveAudioContext = resolve;
        rejectAudioContext = reject;
    });
}

// Initial promise
createNewPromise();

export function getAudioContext(): Promise<AudioContext> {
    return audioContextPromise;
}

export function startAudioContext(): AudioContext {
    if (audioContext && audioContext.state === 'running') {
        resolveAudioContext(audioContext);
        return audioContext;
    }

    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext();
        audioState.context = audioContext;
        
        // Capture the current resolve/reject for this specific context
        const currentResolve = resolveAudioContext;
        const currentReject = rejectAudioContext;

        const handleStateChange = () => {
            if (audioContext?.state === 'running') {
                currentResolve(audioContext);
                audioContext.removeEventListener('statechange', handleStateChange);
            }
        };

        audioContext.addEventListener('statechange', handleStateChange);

        // If it's already running for some reason, resolve immediately
        if (audioContext.state === 'running') {
            currentResolve(audioContext);
        }
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume().catch((err) => {
            rejectAudioContext(err);
        });
    }

    return audioContext;
}

export function closeAudioContext() {
    if (!audioContext || audioContext.state === 'closed') return;
    
    const contextToClose = audioContext;
    audioContext = null;
    
    // Clear all state
    audioState.context = null;
    audioState.masterNode = null;
    audioState.preMasterNode = null;
    audioState.destinationNode = null;

    // Reset promise for the next start IMMEDIATELY and SYNCHRONOUSLY
    createNewPromise();

    contextToClose.close().catch(console.error);
}
