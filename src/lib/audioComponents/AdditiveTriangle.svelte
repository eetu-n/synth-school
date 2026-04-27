<script lang="ts">
  import FaustNode from "$lib/audioFramework/FaustNode";
  import type RoutedAudioNode from "$lib/audioFramework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audioFramework/audioContextManager";
  import HSlider from "$lib/uiComponents/HSlider.svelte";
  import Toggle from "$lib/uiComponents/Toggle.svelte";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let harmonicsEnd = $state(1);
  let isPlaying = $state(false);

  let faustNode = await FaustNode.create(
    "additiveHarmonics",
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
      faustNode.setParamValue("harmonics_end", harmonicsEnd);
      faustNode.setParamValue("wave_type", 2); // Triangle
      faustNode.setParamValue("gate", isPlaying ? 1 : 0);
    }
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>

<div class="flex flex-col gap-6 p-4">
  <Toggle colored={true} bind:checked={isPlaying}>Play</Toggle>

  <div class="flex flex-col gap-2">
    <div class="flex justify-between items-center">
      <label for="harmonics-range" class="text-sm font-medium">Harmonic Range (Odd only)</label>
      <span class="text-xs font-mono">{harmonicsEnd}</span>
    </div>
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
