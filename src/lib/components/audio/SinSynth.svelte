<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import HSlider from "$lib/components/ui/inputs/HSlider.svelte";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let frequency = $state(500);
  let isPlaying = $state(false);

  let faustNode = await FaustNode.create(
    "sinSynth",
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
      faustNode.setParamValue("frequency", frequency);
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
