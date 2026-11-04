<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import GateButton from "$lib/components/ui/inputs/GateButton.svelte";
  import AdsrVis from "$lib/components/ui/viz/AdsrVis.svelte";

  let {
    outputNode,
    attack = $bindable(500),
    decay = $bindable(500),
    sustain = $bindable(0.7),
    release = $bindable(500),
    waveSelect = 0,
    freq = 440,
    gain = 0.5,
    cutoff = 2000,
    resonance = 0.5,
    buttonLabel = "GATE",
    gate = $bindable(false),
    showVisualization = true,
  }: {
    outputNode: RoutedAudioNode | null;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    waveSelect?: number;
    freq?: number;
    gain?: number;
    cutoff?: number;
    resonance?: number;
    buttonLabel?: string;
    gate?: boolean;
    showVisualization?: boolean;
  } = $props();

  const faust = useFaustNode("subtractiveSynth", () => outputNode);

  // --- Parameter Updates ---
  $effect(() => {
    faust.setParam("Waveform", waveSelect);
    faust.setParam("freq", freq);
    faust.setParam("gain", gain);
    faust.setParam("Cutoff", cutoff);
    faust.setParam("Resonance", resonance);
    faust.setParam("Attack", attack);
    faust.setParam("Decay", decay);
    faust.setParam("Sustain", sustain);
    faust.setParam("Release", release);
    faust.setParam("gate", gate);
  });
</script>

<div class="flex flex-col gap-6 p-6 bg-base-200 rounded-2xl shadow-xl border border-base-300 max-w-2xl mx-auto w-full">
  <!-- Envelope Section (ADSR) -->
  <section class="flex flex-col gap-4 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200 leading-none pb-1">
      Envelope (ADSR)
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
      <Knob label="Attack" bind:value={attack} min={0} max={5000} step={1} size={70} scale="exp" exponent={2.32} unit="ms" />
      <Knob label="Decay" bind:value={decay} min={0} max={5000} step={1} size={70} scale="exp" exponent={2.32} unit="ms" />
      <Knob label="Sustain" bind:value={sustain} min={0} max={1} step={0.01} size={70} />
      <Knob label="Release" bind:value={release} min={0} max={5000} step={1} size={70} scale="exp" exponent={2.32} unit="ms" />
    </div>
    {#if showVisualization}
      <AdsrVis {attack} {decay} {sustain} {release} {gate} class="bg-transparent border-0 shadow-none p-0" />
    {/if}
  </section>

  <GateButton
    bind:gate
    pad
    label={buttonLabel}
    activeLabel="HOLD"
  />
</div>
