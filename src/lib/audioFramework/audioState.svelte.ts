import type RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';
import RouterNode from '$lib/audioFramework/RouterNode';
import FaustNode from '$lib/audioFramework/FaustNode';

export const audioState = $state({
    context: null as AudioContext | null,
    destinationNode: null as RoutedAudioNode<AudioDestinationNode> | null,
    masterNode: null as FaustNode | null,
    preMasterNode: null as RouterNode | null,
    loadingCount: 0
});

export const audioLoadingState = {
    get isLoading() {
        return audioState.loadingCount > 0;
    },
    increment() {
        audioState.loadingCount++;
    },
    decrement() {
        audioState.loadingCount = Math.max(0, audioState.loadingCount - 1);
    }
};
