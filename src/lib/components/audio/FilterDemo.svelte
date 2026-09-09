<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";

  let {
    outputNode,
  }: { outputNode: RoutedAudioNode | null } = $props();

  let isPlaying = $state(false);
  let cutoffFreq = $state(500);
  let filtSelect = $state(0); // 0 = LP, 1 = HP, 2 = BP

  let minCutoff = $derived(filtSelect === 2 ? 250 : 20);

  $effect(() => {
    if (cutoffFreq < minCutoff) {
      cutoffFreq = minCutoff;
    }
  });

  let faustNode = await FaustNode.create(
    "filterDemo",
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
      faustNode.setParamValue("cutoffFreq", cutoffFreq);
      faustNode.setParamValue("filtSelect", filtSelect);
      faustNode.setParamValue("play", isPlaying ? 1 : 0);
    }
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col md:flex-row gap-8 items-center justify-center p-4 bg-base-200/50 rounded-xl">
    <div class="flex flex-col gap-2 items-center w-32">
      <span class="text-[10px] uppercase font-bold text-base-content/70">Filter Type</span>
      <div class="flex flex-col gap-1 w-full">
        <button 
          class="btn btn-xs h-8 w-full flex items-center justify-start px-2 gap-2 transition-all {filtSelect === 0 ? 'btn-primary shadow-md' : 'btn-ghost bg-base-100/30 border-base-content/10 border'}"
          onclick={() => filtSelect = 0}
        >
          <div class="w-2 h-2 rounded-full {filtSelect === 0 ? 'bg-white shadow-[0_0_8px_white]' : 'bg-base-content/10'}"></div>
          <span class="text-[10px] font-bold {filtSelect === 0 ? 'text-primary-content' : 'text-base-content/60'}">Lowpass</span>
        </button>
        <button 
          class="btn btn-xs h-8 w-full flex items-center justify-start px-2 gap-2 transition-all {filtSelect === 1 ? 'btn-primary shadow-md' : 'btn-ghost bg-base-100/30 border-base-content/10 border'}"
          onclick={() => filtSelect = 1}
        >
          <div class="w-2 h-2 rounded-full {filtSelect === 1 ? 'bg-white shadow-[0_0_8px_white]' : 'bg-base-content/10'}"></div>
          <span class="text-[10px] font-bold {filtSelect === 1 ? 'text-primary-content' : 'text-base-content/60'}">Highpass</span>
        </button>
        <button 
          class="btn btn-xs h-8 w-full flex items-center justify-start px-2 gap-2 transition-all {filtSelect === 2 ? 'btn-primary shadow-md' : 'btn-ghost bg-base-100/30 border-base-content/10 border'}"
          onclick={() => filtSelect = 2}
        >
          <div class="w-2 h-2 rounded-full {filtSelect === 2 ? 'bg-white shadow-[0_0_8px_white]' : 'bg-base-content/10'}"></div>
          <span class="text-[10px] font-bold {filtSelect === 2 ? 'text-primary-content' : 'text-base-content/60'}">Bandpass</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col items-center">
    <!-- TODO: change to a h-slider that corresponds to the spectrograph -->
      <Knob
        bind:value={cutoffFreq}
        min={minCutoff}
        max={20000}
        step={1}
        label="Cutoff"
        unit="Hz"
        scale="log"
        defaultValue={500}
        size={80}
      />
    </div>
    <Toggle colored={true} bind:checked={isPlaying}>Play Noise</Toggle>
  </div>
</div>
