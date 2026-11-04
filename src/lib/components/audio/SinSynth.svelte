<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import HSlider from "$lib/components/ui/inputs/HSlider.svelte";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let frequency = $state(500);
  let isPlaying = $state(false);

  const faust = useFaustNode("sinSynth", () => outputNode);

  $effect(() => {
    faust.setParam("frequency", frequency);
  });

  $effect(() => {
    faust.setParam("play", isPlaying);
  });
</script>

<div class="flex flex-col gap-4 p-4">
  <div class="flex flex-col gap-2">
    <div class="flex justify-between items-center">
      <label for="frequency" class="text-sm font-medium">Frequency</label>
      <span class="text-xs font-mono">{frequency} Hz</span>
    </div>
    <HSlider
      id="frequency"
      bind:value={frequency}
      min="1"
      max="4000"
      step="1"
      width="100%"
      onpointerdown={() => (isPlaying = true)}
      onpointerup={() => (isPlaying = false)}
      onpointerleave={() => (isPlaying = false)}
    />
  </div>
</div>
