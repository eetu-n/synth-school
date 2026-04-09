<script lang="ts">
  import { Line } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
  } from 'chart.js';
  import { browser } from '$app/environment';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement
  );

  interface Props {
    frequency?: number;
    sampleRate?: number;
    showOriginal?: boolean;
    showAliased?: boolean;
    showSamples?: boolean;
    showValues?: boolean;
    showLabels?: boolean;
    showAxisLabels?: boolean;
  }

  let { 
    frequency = 11, 
    sampleRate = 10, 
    showOriginal = true, 
    showAliased = true, 
    showSamples = true, 
    showValues = true, 
    showLabels = true,
    showAxisLabels = true
  }: Props = $props();

  let chartContainer: HTMLDivElement;

  let primaryTextColor = $state('#1e293b');
  let secondaryTextColor = $state('#64748b');
  let secondaryColor = $state('#1fb0a8');
  let signalActualColor = $state('#e87953');
  let signalAliasedColor = $state('#3b82f6');
  let gridColor = $state('#e2e8f0');

  $effect(() => {
    if (chartContainer) {
      const styles = window.getComputedStyle(chartContainer);
      primaryTextColor = styles.getPropertyValue('--primary-text-color').trim();
      secondaryTextColor = styles.getPropertyValue('--secondary-text-color').trim();
      secondaryColor = styles.getPropertyValue('--primary-color').trim();
      signalActualColor = styles.getPropertyValue('--signal-actual-color').trim();
      signalAliasedColor = styles.getPropertyValue('--signal-aliased-color').trim();
      gridColor = styles.getPropertyValue('--border-color').trim();
    }
  });

  let aliasedFreq = $derived(getAliasedFrequency(frequency, sampleRate));

  function getAliasedFrequency(f: number, fs: number): number {
    const nyquist = fs / 2;
    let relativeFreq = ((f % fs) + fs) % fs;

    return relativeFreq > nyquist 
        ? relativeFreq - fs 
        : relativeFreq;
  }

  let chartData = $derived.by(() => {
    const highFreqData = [];
    const aliasedData = [];
    const samplesData = [];
    
    const duration = 1; // 1 second
    const resolution = 1000;
    
    for (let i = 0; i <= resolution; i++) {
        const t = (i / resolution) * duration;
        highFreqData.push({x: t, y: Math.sin(2 * Math.PI * frequency * t)});
        aliasedData.push({x: t, y: Math.sin(2 * Math.PI * aliasedFreq * t)});
    }
    
    for (let i = 0; i <= sampleRate * duration; i++) {
        const t = i / sampleRate;
        samplesData.push({x: t, y: Math.sin(2 * Math.PI * frequency * t)});
    }

    let datasets = []
    if (showOriginal) {
      datasets.push({
        label: `Actual Signal${showValues ? ` (${Number(frequency.toFixed(2))} Hz)` : ''}`,
        data: highFreqData,
        borderColor: signalActualColor,
        backgroundColor: signalActualColor,
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0,
        order: 3
      })
    };
    if (showAliased && Math.abs(aliasedFreq - frequency) > 0.001) {
      datasets.push({
        label: `Aliased Signal${showValues ? ` (${Number(Math.abs(aliasedFreq).toFixed(2))} Hz)` : ''}`,
        data: aliasedData,
        borderColor: signalAliasedColor,
        backgroundColor: signalAliasedColor,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        order: 2
      })
    };
    if (showSamples) {
      datasets.push({
        label: `Samples${showValues ? ` (${Number(sampleRate.toFixed(2))} Hz)` : ''}`,
        data: samplesData,
        backgroundColor: secondaryColor,
        borderColor: secondaryColor,
        pointRadius: 5,
        showLine: false,
        order: 1
      })
    };

    return {datasets: datasets};
  });
  
  let options = $derived({
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: showValues
        }
    },
    scales: {
        x: {
            type: 'linear' as const,
            min: 0,
            max: 1,
            ticks: {
                display: showAxisLabels,
                color: secondaryTextColor,
                font: { size: 10 },
                callback: (value: any) => showAxisLabels ? value : ''
            },
            grid: {
                color: gridColor,
                drawTicks: false
            },
            border: { display: false }
        },
        y: {
            min: -1.2,
            max: 1.2,
            ticks: {
                display: showAxisLabels,
                color: secondaryTextColor,
                font: { size: 10 },
                callback: (value: any) => showAxisLabels ? value : ''
            },
            grid: {
                color: gridColor,
                drawTicks: false
            },
            border: { display: false }
        }
    }
  });
</script>

<div class="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border dark:border-dark-border p-6 my-4 w-full max-w-3xl mx-auto flex flex-col" bind:this={chartContainer}>
  {#if showLabels}
    <div class="flex justify-center items-center space-x-6 mb-6">
      {#if showSamples}
        <div class="flex items-center space-x-2">
          <div class="w-6 h-2 rounded-sm" style="background-color: {secondaryColor}"></div>
          <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">Samples</span>
        </div>
      {/if}
      {#if showOriginal}
        <div class="flex items-center space-x-2">
          <div class="w-6 h-2 rounded-sm" style="background-color: {signalActualColor}"></div>
          <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">Actual Signal</span>
        </div>
      {/if}
      {#if showAliased && Math.abs(aliasedFreq - frequency) > 0.001}
        <div class="flex items-center space-x-2">
          <div class="w-6 h-2 rounded-sm" style="background-color: {signalAliasedColor}"></div>
          <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">Aliased</span>
        </div>
      {/if}
    </div>
  {/if}

  <div class="w-full aspect-[2/1] relative">
    {#if browser}
      <Line data={chartData} {options} />
    {/if}
  </div>
</div>
