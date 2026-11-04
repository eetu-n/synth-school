<script lang="ts">
  import type FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import GateButton from "$lib/components/ui/inputs/GateButton.svelte";

  let {
    outputNode = null,
    faustNode = $bindable(null),
  }: { 
    outputNode?: RoutedAudioNode | null;
    faustNode?: FaustNode | null;
  } = $props();

  let tempo = $state(90);

  const faust = useFaustNode("synthExamples", () => outputNode);

  $effect(() => {
    faustNode = faust.current;
  });

  $effect(() => {
    faust.setParam("Tempo", tempo);
  });

  function handleGate(param: string, input: boolean) {
    faust.setParam(param, input);
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
