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
  let floatDataArray = $state<Float32Array<ArrayBuffer> | null>(null);

  $effect(() => {
    const inputNode = getInputNode();
    if (!audioState.context || !inputNode) {
      analyser = null;
      dataArray = null;
      floatDataArray = null;
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
    const floatBuffer = new Float32Array(new ArrayBuffer(rawAnalyser.fftSize * 4));

    inputNode.connect(routed);
    analyser = routed;
    dataArray = buffer;
    floatDataArray = floatBuffer;

    return () => {
      inputNode.disconnect(routed);
      analyser = null;
      dataArray = null;
      floatDataArray = null;
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
    get floatDataArray(): Float32Array<ArrayBuffer> | null {
      return floatDataArray;
    },
    get sampleRate(): number {
      return audioState.context?.sampleRate ?? 44100;
    },
    getFloatTimeDomainData(): Float32Array<ArrayBuffer> | null {
      if (analyser?.audioNode && floatDataArray) {
        analyser.audioNode.getFloatTimeDomainData(floatDataArray);
        return floatDataArray;
      }
      return null;
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
