let audioContext: AudioContext | null = null;

/**
 * Returns a singleton AudioContext instance.
 * Creates a new one if it doesn't exist or if the previous one was closed.
 */
export function getAudioContext(): AudioContext | null {
    if (typeof window !== 'undefined') {
        if (!audioContext || audioContext.state === 'closed') {
            audioContext = new AudioContext();
        }
    }
    return audioContext;
}
