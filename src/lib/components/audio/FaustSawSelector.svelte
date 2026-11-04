<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import GateButton from "$lib/components/ui/inputs/GateButton.svelte";

  let {
    outputNode,
    isRightAliasing = true,
  }: { outputNode: RoutedAudioNode; isRightAliasing?: boolean } = $props();

  const faust = useFaustNode("saw_selector", () => outputNode);

  let gateA = $state(false);
  let gateB = $state(false);

  $effect(() => {
    faust.setParam(isRightAliasing ? "gate2" : "gate1", gateA);
  });

  $effect(() => {
    faust.setParam(isRightAliasing ? "gate1" : "gate2", gateB);
  });
</script>

<div class="flex gap-4 justify-center">
  <GateButton bind:gate={gateA}>
    Test A
  </GateButton>

  <GateButton bind:gate={gateB}>
    Test B
  </GateButton>
</div>
