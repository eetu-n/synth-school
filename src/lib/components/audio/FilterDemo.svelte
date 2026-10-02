<script lang="ts">
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";
  import { FilterResponseAnalyzer } from "$lib/audio/dsp/FilterResponseAnalyzer";

  import Noise from "$lib/components/audio/Noise.svelte";

  import Radio from "$lib/components/ui/inputs/Radio.svelte";

  let {
    outputNode,
    lineData = $bindable()
  }: { 
    outputNode: RoutedAudioNode<any> | null,
    lineData?: { f: number, value: number }[]
  } = $props();

  let isPlaying = $state(false);
  let cutoffFreq = $state(500);
  let filtSelect = $state(0); // 0 = LP, 1 = HP, 2 = BP

  let minCutoff = $derived(filtSelect === 2 ? 250 : 20);

  $effect(() => {
    if (cutoffFreq < minCutoff) {
      cutoffFreq = minCutoff;
    }
  });

  const filterAnalyzer = new FilterResponseAnalyzer();

  let audioCtx = await getAudioContext();
  let filterNode = audioCtx.createBiquadFilter();
  filterNode.type = "lowpass";
  let routedFilterNode = new RoutedAudioNode("filterDemo", audioCtx, filterNode);

  $effect(() => {
    return () => {
      filterNode.disconnect();
      routedFilterNode.destroy();
    };
  });

  $effect(() => {
    if (outputNode) {
      routedFilterNode.connect(outputNode);
      return () => routedFilterNode.disconnect(outputNode);
    }
  });

  $effect(() => {
    filterNode.frequency.value = cutoffFreq;
    
    if (filtSelect === 0) filterNode.type = "lowpass";
    else if (filtSelect === 1) filterNode.type = "highpass";
    else if (filtSelect === 2) filterNode.type = "bandpass";
    
    lineData = filterAnalyzer.getResponseLineData(filterNode);
  });
</script>

<Noise outputNode={routedFilterNode} bind:isPlaying />

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
