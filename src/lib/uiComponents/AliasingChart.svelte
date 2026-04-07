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
  }

  let { frequency = 11, sampleRate = 10, showOriginal = true, showAliased = true, showSamples = true, showValues = true, showLabels = true}: Props = $props();

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
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0
      })
    };
    if (showAliased) {
      datasets.push({
        label: `Aliased Signal${showValues ? ` (${Number(Math.abs(aliasedFreq).toFixed(2))} Hz)` : ''}`,
        data: aliasedData,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0
      })
    };
    if (showSamples) {
      datasets.push({
        label: `Samples${showValues ? ` (${Number(sampleRate.toFixed(2))} Hz)` : ''}`,
        data: samplesData,
        backgroundColor: 'black',
        borderColor: 'black',
        pointRadius: 5,
        showLine: false
      })
    };

    return {datasets: datasets};
  });
  
  let options = $derived({
    responsive: true,
    animation: false as const,
    plugins: {
        legend: {
            display: showLabels
        }
    },
    scales: {
        x: {
            title: { display: false, text: 'Time (s)' },
            type: 'linear' as const,
            min: 0,
            max: 1
        },
        y: {
            title: { display: false, text: 'Amplitude' },
            min: -1.2,
            max: 1.2
        }
    }
  });
</script>

<div class="chart-container">
  {#if browser}
    <Line data={chartData} {options} />
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    max-width: 600px;
    margin: 1rem auto;
  }
</style>