<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";

  let {
    outputNode,
    isRightAliasing = true,
  }: { outputNode: RoutedAudioNode; isRightAliasing?: boolean } = $props();

  let faustNode = await FaustNode.create(
    "saw_selector",
    await getAudioContext(),
  );

  let gateA: boolean = $state(false);
  let gateB: boolean = $state(false);

  function handleGateA(input: boolean) {
    if (!faustNode) return;

    gateA = input;

    faustNode.setParamValue(isRightAliasing ? "gate2" : "gate1", gateA ? 1 : 0);
  }

  function handleGateB(input: boolean) {
    if (!faustNode) return;

    gateB = input;
    faustNode.setParamValue(isRightAliasing ? "gate1" : "gate2", gateB ? 1 : 0);
  }

  $effect(() => {
    if (!faustNode || !outputNode) {
      return;
    }
    faustNode.connect(outputNode);
  });

  $effect(() => {
    handleGateA(gateA);
  });

  $effect(() => {
    handleGateB(gateB);
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>

<div>
  <button
    class="btn"
    onpointerdown={() => handleGateA(true)}
    onpointerup={() => handleGateA(false)}
    onpointerleave={() => handleGateA(false)}
  >
    Test A
  </button>

  <button
    class="btn"
    onpointerdown={() => handleGateB(true)}
    onpointerup={() => handleGateB(false)}
    onpointerleave={() => handleGateB(false)}
  >
    Test B
  </button>
</div>
