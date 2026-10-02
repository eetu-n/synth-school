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
    enableSlope = $bindable(false)
  }: { 
    outputNode: RoutedAudioNode<any> | null,
    lineData?: { f: number, value: number }[],
    enableCutoff?: boolean,
    enableResonance?: boolean,
    enableSlope?: boolean
  } = $props();

  let isPlaying = $state(false);
  let cutoffFreq = $state(500);
  let qValue = $state(1);
  let filtSelect = $state(0); // 0 = LP, 1 = HP, 2 = BP

  let minCutoff = $derived(filtSelect === 2 ? 250 : 20);
  let slopeSelect = $state(1); // 1 = 12dB (2-pole), 2 = 24dB (4-pole), 4 = 48dB (8-pole)

  $effect(() => {
    if (cutoffFreq < minCutoff) {
      cutoffFreq = minCutoff;
    }
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
