<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import Knob from "$lib/components/ui/inputs/Knob.svelte";
  import Radio from "$lib/components/ui/inputs/Radio.svelte";

  let {
    outputNode,
    waveSelect = $bindable(0),
    freq = $bindable(440),
    gain = $bindable(0.5),
    cutoff = $bindable(2000),
    resonance = $bindable(0.5),
    attack = $bindable(10),
    decay = $bindable(100),
    sustain = $bindable(0.7),
    release = $bindable(100),
  }: {
    outputNode: RoutedAudioNode | null;
    waveSelect?: number;
    freq?: number;
    gain?: number;
    cutoff?: number;
    resonance?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
  } = $props();

  // --- States ---
  let gate = $state(false);
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
      faustNode.setParamValue("gate", gate ? 1 : 0);
      faustNode.setParamValue("Cutoff", cutoff);
      faustNode.setParamValue("Resonance", resonance);
      faustNode.setParamValue("Attack", attack);
      faustNode.setParamValue("Decay", decay);
      faustNode.setParamValue("Sustain", sustain);
      faustNode.setParamValue("Release", release);
    }
  });
</script>

<div class="flex flex-col gap-8 p-8 bg-base-200 rounded-2xl shadow-xl border border-base-300 max-w-4xl mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    <!-- Left Column: Oscillator & Filter -->
    <div class="flex flex-col gap-8">
      <!-- Oscillator Section -->
      <section class="flex flex-col gap-2 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm">
        <h3 class="text-[11px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200 leading-none pb-1">Oscillator</h3>
        
        <div class="flex flex-wrap items-center gap-8">
          <Radio
            label="Waveform"
            options={[
              { label: "Sawtooth", value: 0 },
              { label: "Square", value: 1 },
              { label: "Triangle", value: 2 }
            ]}
            bind:value={waveSelect}
          />

          <Knob label="Frequency" bind:value={freq} min={20} max={10000} step={1} size={80} scale="log" unit="Hz" />
          <Knob label="Gain" bind:value={gain} min={0} max={1} step={0.01} size={60} />
        </div>
      </section>

      <section class="flex flex-col gap-2 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm">
        <h3 class="text-[11px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200 leading-none pb-1">Filter</h3>
        <div class="flex flex-wrap gap-8 justify-around">
          <Knob label="Cutoff" bind:value={cutoff} min={20} max={20000} step={1} size={80} scale="log" unit="Hz" />
          <Knob label="Resonance" bind:value={resonance} min={0.5} max={10} step={0.01} size={80} />
        </div>
      </section>
    </div>

    <!-- Right Column: Envelope & Gate -->
    <div class="flex flex-col gap-8">
      <section class="flex flex-col gap-2 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm h-full">
        <h3 class="text-[11px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200 leading-none pb-1">Envelope (ADSR)</h3>
        <div class="grid grid-cols-2 gap-y-8 gap-x-4 justify-items-center">
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
          onpointerdown={() => gate = true}
          onpointerup={() => gate = false}
          onpointerleave={() => gate = false}
        >
          {gate ? 'HOLD' : 'GATE'}
        </button>
      </section>
    </div>

  </div>
</div>
