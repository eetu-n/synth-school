<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";

  let {
    outputNode,
    attack = $bindable(10),
    decay = $bindable(100),
    sustain = $bindable(0.7),
    release = $bindable(100),
    waveSelect = 0,
    freq = 440,
    gain = 0.5,
    cutoff = 2000,
    resonance = 0.5,
    buttonLabel = "GATE",
    gate = $bindable(false),
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
  } = $props();

  // --- States ---
  let faustNode = $state<FaustNode | null>(null);

  // Initialize FaustNode reactively when context is ready
  $effect(() => {
    let activeNode: FaustNode | null = null;
    let isDestroyed = false;

    async function init() {
      const context = await getAudioContext();
      if (isDestroyed) return;

      const node = await FaustNode.create("subtractiveSynth", context);
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

  // --- Parameter Updates ---
  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("Waveform", waveSelect);
      faustNode.setParamValue("freq", freq);
      faustNode.setParamValue("gain", gain);
      faustNode.setParamValue("Cutoff", cutoff);
      faustNode.setParamValue("Resonance", resonance);
      faustNode.setParamValue("Attack", attack);
      faustNode.setParamValue("Decay", decay);
      faustNode.setParamValue("Sustain", sustain);
      faustNode.setParamValue("Release", release);
    }
  });

  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("gate", gate ? 1 : 0);
    }
  });
</script>

<div class="flex flex-col gap-6 p-6 bg-base-200 rounded-2xl shadow-xl border border-base-300 max-w-xl mx-auto w-full">
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
  </section>

  <!-- Control Section -->
  <section class="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
    <button
      class="btn btn-primary btn-lg w-full h-24 text-2xl font-black tracking-tighter shadow-lg transition-all active:scale-95"
      onpointerdown={() => (gate = true)}
      onpointerup={() => (gate = false)}
      onpointerleave={() => (gate = false)}
    >
      {gate ? "HOLD" : buttonLabel}
    </button>
  </section>
</div>
