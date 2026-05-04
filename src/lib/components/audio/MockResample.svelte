<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";

  let {
    outputNode,
    frequency = 1000,
    sampleRate = 2000,
    play = false,
  }: {
    outputNode: RoutedAudioNode | null;
    frequency?: number;
    sampleRate?: number;
    play?: boolean;
  } = $props();

  const faustNode = await FaustNode.create(
    "mockResample",
    await getAudioContext(),
  );

  $effect(() => {
    if (faustNode && outputNode && play) {
      faustNode.connect(outputNode);
      return () => {
        faustNode.disconnect(outputNode);
      };
    }
  });

  $effect(() => {
    faustNode?.setParamValue("frequency", frequency);
  });

  $effect(() => {
    faustNode?.setParamValue("sampleRate", sampleRate);
  });

  $effect(() => {
    faustNode?.setParamValue("play", play ? 1 : 0);
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>

