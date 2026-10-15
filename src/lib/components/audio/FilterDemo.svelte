<script lang="ts">
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import Radio from "$lib/components/ui/inputs/Radio.svelte";
  import CascadingFilterNode from "$lib/audio/nodes/CascadingFilterNode";
  import { FilterResponseAnalyzer, type BandRegion, type FilterType } from "$lib/audio/nodes/FilterResponseAnalyzer";

  let {
    inputNode = null,
    outputNode = null,
    filterNode = $bindable<CascadingFilterNode | null>(null),
    lineData = $bindable<{ f: number; value: number }[]>(),
    enableCutoff = false,
    enableResonance = false,
    enableSlope = false,
    showBands = false,
    bandRegions = $bindable<BandRegion[]>([]),
  }: {
    inputNode?: RoutedAudioNode<any> | null;
    outputNode?: RoutedAudioNode<any> | null;
    filterNode?: CascadingFilterNode | null;
    lineData?: { f: number; value: number }[];
    enableCutoff?: boolean;
    enableResonance?: boolean;
    enableSlope?: boolean;
    showBands?: boolean;
    bandRegions?: BandRegion[];
  } = $props();

  // — UI state —
  let cutoffFreq = $state(500);
  let qValue = $state(1);
  let filtSelect = $state<FilterType>("lowpass");
  let slopeSelect = $state(1); // 1 = 12dB, 2 = 24dB, 4 = 48dB

  const MIN_CUTOFF = 20;

  // — Band region computation —
  $effect(() => {
    bandRegions = showBands
      ? FilterResponseAnalyzer.getBandRegions(filtSelect, cutoffFreq, qValue, slopeSelect)
      : [];
  });

  // — Audio node lifecycle —
  $effect(() => {
    let active = true;
    let filter: CascadingFilterNode | null = null;

    (async () => {
      const ctx = await getAudioContext();
      if (!active) return;

      filter = new CascadingFilterNode("filterDemo", ctx);
      filterNode = filter;
    })();

    return () => {
      active = false;
      if (filter) {
        filter.destroy();
        filterNode = null;
      }
    };
  });

  // — Dynamic node routing —
  $effect(() => {
    if (filterNode && inputNode) {
      const src = inputNode;
      const dst = filterNode;
      src.connect(dst);
      return () => {
        src.disconnect(dst);
      };
    }
  });

  $effect(() => {
    if (filterNode && outputNode) {
      const src = filterNode;
      const dst = outputNode;
      src.connect(dst);
      return () => {
        src.disconnect(dst);
      };
    }
  });

  // — Sync filter params whenever UI state changes —
  $effect(() => {
    if (!filterNode) return;
    filterNode.setParams({ cutoff: cutoffFreq, q: qValue, type: filtSelect, slope: slopeSelect });
    lineData = filterNode.getLineData();
  });
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col md:flex-row gap-8 items-center justify-center p-4 bg-base-200/50 rounded-xl">
    <Radio
      label="Filter Type"
      options={[
        { label: "Lowpass",  value: "lowpass"  satisfies FilterType },
        { label: "Highpass", value: "highpass" satisfies FilterType },
        { label: "Bandpass", value: "bandpass" satisfies FilterType },
      ]}
      bind:value={filtSelect}
    />

    {#if enableSlope}
      <Radio
        label="Slope"
        options={[
          { label: "12dB/oct", value: 1 },
          { label: "24dB/oct", value: 2 },
          { label: "48dB/oct", value: 4 },
        ]}
        bind:value={slopeSelect}
      />
    {/if}

    <!-- TODO: change to an h-slider that corresponds to the spectrograph -->
    <div class="flex flex-row gap-4 items-center">
      {#if enableCutoff}
        <Knob
          bind:value={cutoffFreq}
          min={MIN_CUTOFF}
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
  </div>
</div>
