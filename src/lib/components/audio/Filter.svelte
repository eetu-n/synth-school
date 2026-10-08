<script lang="ts">
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { FilterResponseAnalyzer } from "$lib/audio/dsp/FilterResponseAnalyzer";

  let {
    inputNode = $bindable(),
    outputNode,
    cutoffFreq = 500,
    qValue = 1,
    filtSelect = 0,
    slopeSelect = 1,
    lineData = $bindable()
  }: {
    inputNode?: RoutedAudioNode<any> | null;
    outputNode?: RoutedAudioNode<any> | null;
    cutoffFreq?: number;
    qValue?: number;
    filtSelect?: number;
    slopeSelect?: number;
    lineData?: { f: number, value: number }[];
  } = $props();

  const filterAnalyzer = new FilterResponseAnalyzer();

  let audioCtx = await getAudioContext();
  let filterNodes = [
    audioCtx.createBiquadFilter(),
    audioCtx.createBiquadFilter(),
    audioCtx.createBiquadFilter(),
    audioCtx.createBiquadFilter()
  ];
  let routedNodes = filterNodes.map((fn, i) => new RoutedAudioNode(`filter_${i}`, audioCtx, fn));

  // Expose the first node as the input for upstream components
  inputNode = routedNodes[0];

  // Chain them together
  for (let i = 0; i < 3; i++) {
    routedNodes[i].connect(routedNodes[i+1]);
  }

  $effect(() => {
    return () => routedNodes.forEach(rn => rn.destroy());
  });

  $effect(() => {
    if (outputNode) {
      const activeNode = routedNodes[slopeSelect - 1];
      activeNode.connect(outputNode);
      return () => activeNode.disconnect(outputNode);
    }
  });

  $effect(() => {
    filterNodes.forEach(fn => {
      fn.frequency.value = cutoffFreq;
      fn.Q.value = qValue / slopeSelect;
      if (filtSelect === 0) fn.type = "lowpass";
      else if (filtSelect === 1) fn.type = "highpass";
      else if (filtSelect === 2) fn.type = "bandpass";
    });
    
    lineData = filterAnalyzer.getResponseLineData(filterNodes[0], 1000, 20, 20000, slopeSelect);
  });
</script>