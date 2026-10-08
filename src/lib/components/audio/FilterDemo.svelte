<script lang="ts">
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";
  
  import Filter from "$lib/components/audio/Filter.svelte";
  import Noise from "$lib/components/audio/Noise.svelte";
  import Radio from "$lib/components/ui/inputs/Radio.svelte";

  let {
    outputNode,
    lineData = $bindable(),
    enableCutoff = $bindable(false),
    enableResonance = $bindable(false),
    enableSlope = $bindable(false),
    showBands = $bindable(false),
    bandRegions = $bindable([])
  }: { 
    outputNode: RoutedAudioNode<any> | null,
    lineData?: { f: number, value: number }[],
    enableCutoff?: boolean,
    enableResonance?: boolean,
    enableSlope?: boolean,
    showBands?: boolean,
    bandRegions?: { startF: number, endF: number, label: string, color?: string }[]
  } = $props();

  let isPlaying = $state(false);
  let cutoffFreq = $state(500);
  let qValue = $state(1);
  let filtSelect = $state(0); // 0 = LP, 1 = HP, 2 = BP

  let minCutoff = 20;
  let slopeSelect = $state(1); // 1 = 12dB (2-pole), 2 = 24dB (4-pole), 4 = 48dB (8-pole)

  $effect(() => {
    if (cutoffFreq < minCutoff) {
      cutoffFreq = minCutoff;
    }
  });

  $effect(() => {
    if (!showBands) {
      bandRegions = [];
      return;
    }

    const regions: { startF: number, endF: number, label: string, color?: string }[] = [];
    const passColor = "--color-passband-val";
    const stopColor = "--color-stopband-val";
    const transColor = "--color-transitionband-val";

    switch (filtSelect) {
      case 0: { // LP
        const stopMultiplier = Math.pow(2, 2 / slopeSelect);
        const stopF = cutoffFreq * stopMultiplier;
        
        regions.push({ startF: 0.1, endF: cutoffFreq, label: "Passband", color: passColor });
        regions.push({ startF: cutoffFreq, endF: stopF, label: "Transition Band", color: transColor });
        regions.push({ startF: stopF, endF: 100000, label: "Stopband", color: stopColor });
        break;
      }
      case 1: { // HP
        const stopDivisor = Math.pow(2, 2 / slopeSelect);
        const stopF = cutoffFreq / stopDivisor;
        
        regions.push({ startF: 0.1, endF: stopF, label: "Stopband", color: stopColor });
        regions.push({ startF: stopF, endF: cutoffFreq, label: "Transition Band", color: transColor });
        regions.push({ startF: cutoffFreq, endF: 100000, label: "Passband", color: passColor });
        break;
      }
      case 2: { // BP
        const actualQ = qValue + 1;
        const bw = cutoffFreq / actualQ;
        const f1 = cutoffFreq - bw / 2;
        const f2 = cutoffFreq + bw / 2;
        
        const transMult = Math.pow(2, 1.5 / slopeSelect);
        const stop1 = f1 / transMult;
        const stop2 = f2 * transMult;
        
        regions.push({ startF: 0.1, endF: stop1, label: "Stopband", color: stopColor });
        regions.push({ startF: stop1, endF: f1, label: "Transition Band", color: transColor });
        regions.push({ startF: f1, endF: f2, label: "Passband", color: passColor });
        regions.push({ startF: f2, endF: stop2, label: "Transition Band", color: transColor });
        regions.push({ startF: stop2, endF: 100000, label: "Stopband", color: stopColor });
        break;
      }
    }

    bandRegions = regions;
  });

  let audioCtx = await getAudioContext();
  let filterInputNode = $state<RoutedAudioNode<any> | null>(null);

</script>

<Filter 
  bind:inputNode={filterInputNode}
  {outputNode}
  {cutoffFreq}
  {qValue}
  {filtSelect}
  {slopeSelect}
  bind:lineData
/>
<Noise outputNode={filterInputNode} bind:isPlaying />

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col md:flex-row gap-8 items-center justify-center p-4 bg-base-200/50 rounded-xl">
    <Radio
      label="Filter Type"
      options={[
        { label: "Lowpass", value: 0 },
        { label: "Highpass", value: 1 },
        { label: "Bandpass", value: 2 }
      ]}
      bind:value={filtSelect}
    />
    
    {#if enableSlope}
      <Radio
        label="Slope"
        options={[
          { label: "12dB/oct", value: 1 },
          { label: "24dB/oct", value: 2 },
          { label: "48dB/oct", value: 4 }
        ]}
        bind:value={slopeSelect}
      />
    {/if}

    <div class="flex flex-row gap-4 items-center">
    <!-- TODO: change to a h-slider that corresponds to the spectrograph -->
      {#if enableCutoff}
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
      {/if}
      {#if enableResonance}
        <Knob
          bind:value={qValue}
          min={0.1}
          max={20}
          step={0.1}
          label="Resonance (Q)"
          defaultValue={1}
          size={80}
        />
      {/if}
    </div>
    <Toggle colored={true} bind:checked={isPlaying}>Play Noise</Toggle>
  </div>
</div>
