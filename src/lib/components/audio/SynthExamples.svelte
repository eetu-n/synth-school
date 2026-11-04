<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import GateButton from "$lib/components/ui/inputs/GateButton.svelte";

  let {
    outputNode = null,
    faustNode = $bindable(null),
  }: { 
    outputNode?: RoutedAudioNode | null;
    faustNode?: FaustNode | null;
  } = $props();

  let tempo = $state(90);

  $effect(() => {
    let activeNode: FaustNode | null = null;
    let isDestroyed = false;

    async function init() {
      const context = await getAudioContext();
      if (isDestroyed) return;

      const node = await FaustNode.create("synthExamples", context);
      if (isDestroyed) {
        node?.destroy();
        return;
      }
      faustNode = node;
      activeNode = node;
    }

    init();

    return () => {
      isDestroyed = true;
      activeNode?.destroy();
      faustNode = null;
    };
  });

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

  function handleGate(param: string, input: boolean) {
    if (!faustNode) return;
    faustNode.setParamValue(param, input ? 1 : 0);
  }
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-wrap gap-4 justify-center">
    <GateButton onGate={(active) => handleGate("Sawtooth", active)}>
      Sawtooth
    </GateButton>

    <GateButton onGate={(active) => handleGate("Square", active)}>
      Square
    </GateButton>

    <GateButton onGate={(active) => handleGate("Triangle", active)}>
      Triangle
    </GateButton>

    <GateButton onGate={(active) => handleGate("Sine", active)}>
      Sine
    </GateButton>
  </div>
</div>
