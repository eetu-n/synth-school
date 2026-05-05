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
    
    // Target Parameters
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
  }

  let { 
    outputNode,
    question = "Try to match the sound of the target synthesizer by adjusting the controls.",
    prev, 
    next,
    
    // Default target values
    waveform = 0,
    frequency = 440,
    cutoff = 2000,
    resonance = 1.0,
    gain = 0.5,
    attack = 10,
    decay = 100,
    sustain = 0.7,
    release = 200,

    // Default thresholds
    thresholdFreq = 10,
    thresholdCutoff = 100,
    thresholdResonance = 0.2,
    thresholdGain = 0.05,
    thresholdAttack = 50,
    thresholdDecay = 100,
    thresholdSustain = 0.1,
    thresholdRelease = 100
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

  function checkAnswer() {
    showFeedback = true;
    
    const waveformMatch = currentParams.waveform === waveform;
    const freqMatch = Math.abs(currentParams.frequency - frequency) <= thresholdFreq;
    const cutoffMatch = Math.abs(currentParams.cutoff - cutoff) <= thresholdCutoff;
    const resonanceMatch = Math.abs(currentParams.resonance - resonance) <= thresholdResonance;
    const gainMatch = Math.abs(currentParams.gain - gain) <= thresholdGain;
    const attackMatch = Math.abs(currentParams.attack - attack) <= thresholdAttack;
    const decayMatch = Math.abs(currentParams.decay - decay) <= thresholdDecay;
    const sustainMatch = Math.abs(currentParams.sustain - sustain) <= thresholdSustain;
    const releaseMatch = Math.abs(currentParams.release - release) <= thresholdRelease;
    
    if (waveformMatch && freqMatch && cutoffMatch && resonanceMatch && 
        gainMatch && attackMatch && decayMatch && sustainMatch && releaseMatch) {
      isCorrect = true;
    } else {
      isCorrect = false;
    }
  }
</script>

{#snippet leftSide()}
  <div class="flex flex-col gap-6 h-full">
    <div class="text-xs font-bold text-primary uppercase tracking-[0.2em] opacity-80">Target Sound</div>
    
    {#if typeof question === 'string'}
      <p class="text-lg font-medium">{question}</p>
    {:else}
      {@render question()}
    {/if}

    <div class="mt-auto mb-auto">
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

    {#if showFeedback}
      <div class="p-4 rounded-xl border-2 transition-all {isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}">
        <h4 class="font-bold {isCorrect ? 'text-green-600' : 'text-red-600'}">
          {isCorrect ? 'Perfect Match!' : 'Not quite there yet...'}
        </h4>
        {#if !isCorrect}
          <ul class="text-xs mt-2 grid grid-cols-2 gap-x-4 list-disc list-inside opacity-80">
            {#if currentParams.waveform !== waveform}<li>Check Waveform</li>{/if}
            {#if Math.abs(currentParams.frequency - frequency) > thresholdFreq}<li>Frequency off</li>{/if}
            {#if Math.abs(currentParams.cutoff - cutoff) > thresholdCutoff}<li>Cutoff off</li>{/if}
            {#if Math.abs(currentParams.resonance - resonance) > thresholdResonance}<li>Resonance off</li>{/if}
            {#if Math.abs(currentParams.gain - gain) > thresholdGain}<li>Gain off</li>{/if}
            {#if Math.abs(currentParams.attack - attack) > thresholdAttack}<li>Attack off</li>{/if}
            {#if Math.abs(currentParams.decay - decay) > thresholdDecay}<li>Decay off</li>{/if}
            {#if Math.abs(currentParams.sustain - sustain) > thresholdSustain}<li>Sustain off</li>{/if}
            {#if Math.abs(currentParams.release - release) > thresholdRelease}<li>Release off</li>{/if}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet rightSide()}
  <div class="flex flex-col gap-6 h-full">
    <div class="text-xs font-bold text-secondary uppercase tracking-[0.2em] opacity-80">Your Synth</div>
    
    <div class="flex-grow flex items-center justify-center overflow-y-auto">
      {#if outputNode}
        <div class="scale-90 xl:scale-100 py-4">
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

    <div class="flex justify-end pt-4 border-t border-border/30">
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
