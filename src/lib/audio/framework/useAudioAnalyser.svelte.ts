import { audioState } from "$lib/audio/framework/audioState.svelte";
import RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";

export interface UseAudioAnalyserOptions {
  name?: string;
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

export function useAudioAnalyser(
  getInputNode: () => RoutedAudioNode<any> | null | undefined,
  options: UseAudioAnalyserOptions = {}
) {
  const {
    name = "analyser",
    fftSize = 2048,
    smoothingTimeConstant,
    minDecibels,
    maxDecibels,
  } = options;

  let analyser = $state<RoutedAudioNode<AnalyserNode> | null>(null);
  let dataArray = $state<Uint8Array<ArrayBuffer> | null>(null);

  $effect(() => {
    const inputNode = getInputNode();
    if (!audioState.context || !inputNode) {
      analyser = null;
      dataArray = null;
      return;
    }

    const rawAnalyser = audioState.context.createAnalyser();
    rawAnalyser.fftSize = fftSize;
    if (smoothingTimeConstant !== undefined) {
      rawAnalyser.smoothingTimeConstant = smoothingTimeConstant;
    }
    if (minDecibels !== undefined) rawAnalyser.minDecibels = minDecibels;
    if (maxDecibels !== undefined) rawAnalyser.maxDecibels = maxDecibels;

    const routed = new RoutedAudioNode(name, audioState.context, rawAnalyser);
    const buffer = new Uint8Array(new ArrayBuffer(rawAnalyser.frequencyBinCount));

    inputNode.connect(routed);
    analyser = routed;
    dataArray = buffer;

    return () => {
      inputNode.disconnect(routed);
      analyser = null;
      dataArray = null;
    };
  });

  return {
    get analyser() {
      return analyser;
    },
    get audioNode() {
      return analyser?.audioNode ?? null;
    },
    get dataArray(): Uint8Array<ArrayBuffer> | null {
      return dataArray;
    },
    get sampleRate(): number {
      return audioState.context?.sampleRate ?? 44100;
    },
    getTimeDomainData(): Uint8Array<ArrayBuffer> | null {
      if (analyser?.audioNode && dataArray) {
        analyser.audioNode.getByteTimeDomainData(dataArray);
        return dataArray;
      }
      return null;
    },
    getFrequencyData(): Uint8Array<ArrayBuffer> | null {
      if (analyser?.audioNode && dataArray) {
        analyser.audioNode.getByteFrequencyData(dataArray);
        return dataArray;
      }
      return null;
    },
  };
}
