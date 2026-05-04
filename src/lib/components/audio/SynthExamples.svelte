<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let faustNode = await FaustNode.create(
    "synthExamples",
    await getAudioContext(),
  );

  let tempo = $state(90);

  $effect(() => {
    if (faustNode && outputNode) {
      faustNode.connect(outputNode);
      return () => faustNode?.disconnect(outputNode);
    }
  });

  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("Tempo", tempo);
    }
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });

  function handleGate(param: string, input: boolean) {
    if (!faustNode) return;
    faustNode.setParamValue(param, input ? 1 : 0);
  }
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-wrap gap-4 justify-center">
    <button
      class="btn"
      onpointerdown={() => handleGate("Sawtooth", true)}
      onpointerup={() => handleGate("Sawtooth", false)}
      onpointerleave={() => handleGate("Sawtooth", false)}
    >
      Sawtooth
    </button>

    <button
      class="btn"
      onpointerdown={() => handleGate("Square", true)}
      onpointerup={() => handleGate("Square", false)}
      onpointerleave={() => handleGate("Square", false)}
    >
      Square
    </button>

    <button
      class="btn"
      onpointerdown={() => handleGate("Triangle", true)}
      onpointerup={() => handleGate("Triangle", false)}
      onpointerleave={() => handleGate("Triangle", false)}
    >
      Triangle
    </button>
    
    <button
      class="btn"
      onpointerdown={() => handleGate("Sine", true)}
      onpointerup={() => handleGate("Sine", false)}
      onpointerleave={() => handleGate("Sine", false)}
    >
      Sine
    </button>
  </div>
</div>
