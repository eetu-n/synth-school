import type RoutedAudioNode from './RoutedAudioNode';

export const audioState = $state({
    context: null as AudioContext | null,
    masterNode: null as RoutedAudioNode | null
});
