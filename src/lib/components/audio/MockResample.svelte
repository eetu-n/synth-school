<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";

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

  const faust = useFaustNode("mockResample", () => (play ? outputNode : null));

  $effect(() => {
    faust.setParam("frequency", frequency);
  });

  $effect(() => {
    faust.setParam("sampleRate", sampleRate);
  });

  $effect(() => {
    faust.setParam("play", play);
  });
</script>

