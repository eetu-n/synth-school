<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import type FaustNode from "$lib/audio/framework/FaustNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";

  let {
    outputNode = null,
    faustNode = $bindable<FaustNode | null>(null),
    noiseNode = $bindable<FaustNode | null>(null),
    isPlaying = $bindable(false),
  }: {
    outputNode?: RoutedAudioNode<any> | null;
    faustNode?: FaustNode | null;
    noiseNode?: FaustNode | null;
    isPlaying?: boolean;
  } = $props();

  const faust = useFaustNode("noise", () => outputNode);

  $effect(() => {
    faustNode = faust.current;
    noiseNode = faust.current;
  });

  // Sync play state
  $effect(() => {
    faust.setParam("play", isPlaying);
  });
</script>

<div class="flex items-center justify-center p-2">
  <Toggle colored={true} bind:checked={isPlaying}>Play Noise</Toggle>
</div>
