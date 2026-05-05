<script lang="ts">
  import FaustNode from "$lib/audio/framework/FaustNode";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";

  let {
    outputNode,
    buttonLabel = 'TRIGGER',
    waveform = 0,
    frequency = 440,
    cutoff = 2000,
    resonance = 1.0,
    gain = 0.5,
    attack = 10,
    decay = 100,
    sustain = 0.7,
    release = 200
  }: { 
    outputNode: RoutedAudioNode | null,
    buttonLabel: string,
    waveform?: number,
    frequency?: number,
    cutoff?: number,
    resonance?: number,
    gain?: number,
    attack?: number,
    decay?: number,
    sustain?: number,
    release?: number
  } = $props();

  let gate = $state(false);

  let faustNode = await FaustNode.create(
    "subtractiveSynth",
    await getAudioContext(),
  );

  $effect(() => {
    if (faustNode && outputNode) {
      faustNode.connect(outputNode);
      return () => faustNode?.disconnect(outputNode);
    }
  });

  // Apply static parameters once or when they change via props
  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("Waveform", waveform);
      faustNode.setParamValue("freq", frequency);
      faustNode.setParamValue("gain", gain);
      faustNode.setParamValue("Cutoff", cutoff);
      faustNode.setParamValue("Resonance", resonance);
      faustNode.setParamValue("Attack", attack);
      faustNode.setParamValue("Decay", decay);
      faustNode.setParamValue("Sustain", sustain);
      faustNode.setParamValue("Release", release);
    }
  });

  // Handle Gate interaction
  $effect(() => {
    if (faustNode) {
      faustNode.setParamValue("gate", gate ? 1 : 0);
    }
  });

  $effect(() => {
    return () => faustNode?.destroy();
  });
</script>

  <button 
    class="btn btn-primary btn-lg w-full h-32 text-2xl font-black tracking-tighter shadow-xl transition-all active:scale-95 group relative overflow-hidden"
    onpointerdown={() => gate = true}
    onpointerup={() => gate = false}
    onpointerleave={() => gate = false}
  >
    <!-- Simple visual feedback glow -->
    {#if gate}
      <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
    {/if}
    
    <div class="flex flex-col items-center gap-1">
      <span class="relative z-10">{gate ? 'HOLDING' : buttonLabel }</span>
    </div>
  </button>
