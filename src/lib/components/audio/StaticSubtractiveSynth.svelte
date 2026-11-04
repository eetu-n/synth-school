<script lang="ts">
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import { useFaustNode } from "$lib/audio/framework/useFaustNode.svelte";
  import GateButton from "$lib/components/ui/inputs/GateButton.svelte";

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
    buttonLabel?: string,
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

  const faust = useFaustNode("subtractiveSynth", () => outputNode);

  // Apply static parameters once or when they change via props
  $effect(() => {
    faust.setParam("Waveform", waveform);
    faust.setParam("freq", frequency);
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
  
  <GateButton
    bind:gate
    pad
    class="h-32 shadow-xl group relative overflow-hidden"
  >
    <!-- Simple visual feedback glow -->
    {#if gate}
      <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
    {/if}
    
    <div class="flex flex-col items-center gap-1">
      <span class="relative z-10">{gate ? 'HOLDING' : buttonLabel}</span>
    </div>
  </GateButton>
