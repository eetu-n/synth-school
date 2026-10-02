<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";

  let {
    outputNode,
    isPlaying = $bindable(false)
  }: { 
    outputNode: RoutedAudioNode<any> | null,
    isPlaying?: boolean
  } = $props();

  let faustNode = await FaustNode.create(
    "noise",
    await getAudioContext(),
  );

  $effect(() => {
    if (faustNode && outputNode) {
      faustNode.connect(outputNode);
      return () => faustNode?.disconnect(outputNode);
    }
  });

  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("play", isPlaying ? 1 : 0);
    }
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>
