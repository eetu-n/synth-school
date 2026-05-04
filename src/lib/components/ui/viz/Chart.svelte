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
    signal: number[] | ((t: number) => number);
    duration?: number;
    points?: number;
    label?: string;
    showLabels?: boolean;
    showAxisLabels?: boolean;
    showValues?: boolean;
    color?: string;
    minY?: number;
    maxY?: number;
  }

  let { 
    signal,
    duration = 1,
    points = 1000,
    label = 'Signal',
    showLabels = true,
    showAxisLabels = true,
    showValues = false,
    color,
    minY = -1.2,
    maxY = 1.2
  }: Props = $props();

  let chartContainer: HTMLDivElement;

  let primaryTextColor = $state('#1e293b');
  let secondaryTextColor = $state('#64748b');
  let signalColor = $state('#e87953');
  let gridColor = $state('#e2e8f0');

  $effect(() => {
    if (chartContainer) {
      const styles = window.getComputedStyle(chartContainer);
      primaryTextColor = styles.getPropertyValue('--primary-text-color').trim();
      secondaryTextColor = styles.getPropertyValue('--secondary-text-color').trim();
      signalColor = color || styles.getPropertyValue('--signal-actual-color').trim() || styles.getPropertyValue('--primary-color').trim();
      gridColor = styles.getPropertyValue('--color-grid-val').trim() || styles.getPropertyValue('--border-color').trim();
    }
  });

  let chartData = $derived.by(() => {
    const data = [];
    
    if (typeof signal === 'function') {
      const resolution = points;
      for (let i = 0; i <= resolution; i++) {
        const t = (i / resolution) * duration;
        data.push({x: t, y: signal(t)});
      }
    } else {
      const len = signal.length;
      if (len > 0) {
        for (let i = 0; i < len; i++) {
          const t = (i / Math.max(1, len - 1)) * duration;
          data.push({x: t, y: signal[i]});
        }
      }
    }

    return {
      datasets: [{
        label: label,
        data: data,
        borderColor: signalColor,
        backgroundColor: signalColor,
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0,
      }]
    };
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
            max: duration,
            ticks: {
                display: showAxisLabels,
                color: secondaryTextColor,
                font: { size: 10 }
            },
            grid: {
                color: gridColor,
                drawTicks: false
            },
            border: { display: false }
        },
        y: {
            min: minY,
            max: maxY,
            ticks: {
                display: showAxisLabels,
                color: secondaryTextColor,
                font: { size: 10 }
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
  {#if showLabels && label}
    <div class="flex justify-center items-start space-x-8 mb-6">
      <div class="flex flex-col items-center">
        <div class="flex items-center space-x-2 mb-1">
          <div class="w-6 h-2 rounded-sm" style="background-color: {signalColor}"></div>
          <span class="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  {/if}

  <div class="w-full aspect-[2/1] relative">
    {#if browser}
      <Line data={chartData} {options} />
    {/if}
  </div>
</div>
