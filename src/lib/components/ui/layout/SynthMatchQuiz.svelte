<script lang="ts">
  import type { Snippet } from 'svelte';
  import VSplitDiv from '$lib/components/ui/layout/VSplitDiv.svelte';
  import StaticSubtractiveSynth from '$lib/components/audio/StaticSubtractiveSynth.svelte';
  import SubtractiveSynth from '$lib/components/audio/SubtractiveSynth.svelte';
  import type RoutedAudioNode from '$lib/audio/framework/RoutedAudioNode';

  interface Props {
    outputNode: RoutedAudioNode | null;
    question?: string | Snippet;
    prev?: string;
    next?: string;
    
    // Target Parameters (Optional - will be randomized if not provided)
    waveform?: number;
    frequency?: number;
    cutoff?: number;
    resonance?: number;
    gain?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;

    // Thresholds
    thresholdFreq?: number;
    thresholdCutoff?: number;
    thresholdResonance?: number;
    thresholdGain?: number;
    thresholdAttack?: number;
    thresholdDecay?: number;
    thresholdSustain?: number;
    thresholdRelease?: number;

    randomize?: boolean; // If true, forces randomization even if defaults are provided
  }

  // Helper for stable random values
  const randomBetween = (min: number, max: number, step: number = 1) => {
    const val = Math.random() * (max - min) + min;
    return Math.round(val / step) * step;
  };

  const initialRandoms = {
    waveform: Math.floor(Math.random() * 3),
    frequency: randomBetween(200, 1200, 10),
    cutoff: randomBetween(400, 5000, 10),
    resonance: randomBetween(1, 6, 0.1),
    gain: 0.5,
    attack: randomBetween(5, 300, 1),
    decay: randomBetween(50, 400, 1),
    sustain: randomBetween(0.2, 0.8, 0.05),
    release: randomBetween(100, 1000, 1)
  };

  let { 
    outputNode,
    question = "Try to match the sound of the target synthesizer by adjusting the controls.",
    prev, 
    next,
    
    // Default target values (use randoms if not provided)
    waveform = initialRandoms.waveform,
    frequency = initialRandoms.frequency,
    cutoff = initialRandoms.cutoff,
    resonance = initialRandoms.resonance,
    gain = initialRandoms.gain,
    attack = initialRandoms.attack,
    decay = initialRandoms.decay,
    sustain = initialRandoms.sustain,
    release = initialRandoms.release,

    // Default thresholds
    thresholdFreq = 20,
    thresholdCutoff = 200,
    thresholdResonance = 0.5,
    thresholdGain = 0.1,
    thresholdAttack = 100,
    thresholdDecay = 150,
    thresholdSustain = 0.15,
    thresholdRelease = 200
  }: Props = $props();

  // Current values from the interactive synth
  let currentParams = $state({
    waveform: 0,
    frequency: 440,
    cutoff: 2000,
    resonance: 0.5,
    gain: 0.5,
    attack: 10,
    decay: 100,
    sustain: 0.7,
    release: 100
  });

  let isCorrect = $state(false);
  let showFeedback = $state(false);
  let feedbackSnapshot = $state({
    waveform: true,
    frequency: true,
    cutoff: true,
    resonance: true,
    gain: true,
    attack: true,
    decay: true,
    sustain: true,
    release: true
  });

  function checkAnswer() {
    showFeedback = true;
    
    feedbackSnapshot = {
      waveform: currentParams.waveform === waveform,
      frequency: Math.abs(currentParams.frequency - frequency) <= thresholdFreq,
      cutoff: Math.abs(currentParams.cutoff - cutoff) <= thresholdCutoff,
      resonance: Math.abs(currentParams.resonance - resonance) <= thresholdResonance,
      gain: Math.abs(currentParams.gain - gain) <= thresholdGain,
      attack: Math.abs(currentParams.attack - attack) <= thresholdAttack,
      decay: Math.abs(currentParams.decay - decay) <= thresholdDecay,
      sustain: Math.abs(currentParams.sustain - sustain) <= thresholdSustain,
      release: Math.abs(currentParams.release - release) <= thresholdRelease
    };
    
    isCorrect = Object.values(feedbackSnapshot).every(v => v);
  }
</script>

{#snippet leftSide()}
  <div class="flex flex-col gap-6 flex-1 pb-6">
    <div class="text-xs font-bold text-primary uppercase tracking-[0.2em] opacity-80 hidden xl:block">Target Sound</div>
    
    {#if typeof question === 'string'}
      <p class="text-lg font-medium leading-tight">{question}</p>
    {:else}
      {@render question()}
    {/if}

    <div class="w-full">
      {#if outputNode}
        <StaticSubtractiveSynth 
          {outputNode} 
          {waveform}
          {frequency}
          {cutoff}
          {resonance}
          {gain}
          {attack}
          {decay}
          {sustain}
          {release}
        />
      {/if}
    </div>

    <div class="hidden xl:block mt-auto w-full">
      {@render feedbackBlock()}
    </div>
  </div>
{/snippet}

{#snippet rightSide()}
  <div class="flex flex-col gap-6 flex-1 pb-6">
    <div class="text-xs font-bold text-secondary uppercase tracking-[0.2em] opacity-80 hidden xl:block">Your Synth</div>
    
    <div class="w-full">
      {#if outputNode}
        <div class="py-4 w-full">
           <SubtractiveSynth 
             {outputNode}
             bind:waveSelect={currentParams.waveform}
             bind:freq={currentParams.frequency}
             bind:cutoff={currentParams.cutoff}
             bind:resonance={currentParams.resonance}
             bind:gain={currentParams.gain}
             bind:attack={currentParams.attack}
             bind:decay={currentParams.decay}
             bind:sustain={currentParams.sustain}
             bind:release={currentParams.release}
           />
        </div>
      {/if}
    </div>

    <div class="xl:hidden w-full">
      {@render feedbackBlock()}
    </div>

    <div class="flex justify-end pt-4 border-t border-border/30 mt-6">
      <button 
        onclick={checkAnswer}
        class="btn btn-primary px-12"
      >
        Check Match
      </button>
    </div>
  </div>
{/snippet}

<VSplitDiv 
  leftSide={leftSide} 
  rightSide={rightSide}
  {prev}
  next={isCorrect ? next : undefined}
  leftTabTitle="Challenge"
  rightTabTitle="Your Controls"
/>

{#snippet feedbackBlock()}
    {#if showFeedback}
      <div class="p-4 rounded-xl border-2 transition-all {isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}">
        <h4 class="font-bold {isCorrect ? 'text-green-600' : 'text-red-600'}">
          {isCorrect ? 'Perfect Match!' : 'Not quite there yet...'}
        </h4>
        {#if !isCorrect}
          <div class="text-[10px] mt-2 text-base-content/60 font-medium mb-1">HINTS:</div>
          <ul class="text-[11px] grid grid-cols-2 gap-x-4 gap-y-1 list-disc list-inside opacity-80">
            {#if !feedbackSnapshot.waveform}<li>Check Waveform</li>{/if}
            {#if !feedbackSnapshot.frequency}<li>Frequency off</li>{/if}
            {#if !feedbackSnapshot.cutoff}<li>Cutoff off</li>{/if}
            {#if !feedbackSnapshot.resonance}<li>Resonance off</li>{/if}
            {#if !feedbackSnapshot.gain}<li>Gain off</li>{/if}
            {#if !feedbackSnapshot.attack}<li>Attack off</li>{/if}
            {#if !feedbackSnapshot.decay}<li>Decay off</li>{/if}
            {#if !feedbackSnapshot.sustain}<li>Sustain off</li>{/if}
            {#if !feedbackSnapshot.release}<li>Release off</li>{/if}
          </ul>
        {/if}
      </div>
    {/if}
{/snippet}
