<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import HSlider from "$lib/components/ui/inputs/HSlider.svelte";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let harmonicsEnd = $state(1);
  let isPlaying = $state(false);

  const faust = useFaustNode("additiveHarmonics", () => outputNode);

  $effect(() => {
    faust.setParam("harmonics_end", harmonicsEnd);
    faust.setParam("wave_type", 0);
    faust.setParam("gate", isPlaying);
  });
</script>

<div class="flex flex-col gap-6 p-4">
  <Toggle colored={true} bind:checked={isPlaying}>Play</Toggle>

  <div class="flex flex-col gap-2">
    <label for="harmonics-range" class="text-sm font-medium">Harmonic Range</label>
    <HSlider
      bind:value={harmonicsEnd}
      min={1}
      max={100}
      step={1}
      width="100%"
      onpointerdown={() => (isPlaying = true)}
      onpointerup={() => (isPlaying = false)}
    />
  </div>
</div>
