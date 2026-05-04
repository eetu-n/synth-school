<script lang="ts">
  interface Props {
    start: number;
    end: number;
    min?: number;
    max?: number;
    step?: number;
    width?: string | number;
  }

  let {
    start = $bindable(1),
    end = $bindable(10),
    min = 1,
    max = 50,
    step = 1,
    width = "100%"
  }: Props = $props();

  function handleStartChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (val > end) {
      start = end;
    } else {
      start = val;
    }
  }

  function handleEndChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (val < start) {
      end = start;
    } else {
      end = val;
    }
  }

  let leftPercent = $derived(((start - min) / (max - min)) * 100);
  let rightPercent = $derived(((end - min) / (max - min)) * 100);
</script>

<div class="range-slider-container" style="width: {typeof width === 'number' ? width + 'px' : width};">
  <div class="slider-track"></div>
  <div 
    class="slider-range" 
    style="left: {leftPercent}%; right: {100 - rightPercent}%;"
  ></div>
  
  <input
    type="range"
    {min}
    {max}
    {step}
    value={start}
    oninput={handleStartChange}
    class="thumb thumb-left"
  />
  
  <input
    type="range"
    {min}
    {max}
    {step}
    value={end}
    oninput={handleEndChange}
    class="thumb thumb-right"
  />
</div>

<style>
  .range-slider-container {
    position: relative;
    height: 16px;
    display: flex;
    align-items: center;
  }

  .slider-track {
    position: absolute;
    height: 4px;
    width: 100%;
    background-color: var(--color-border-val);
    border-radius: 2px;
    z-index: 1;
  }

  .slider-range {
    position: absolute;
    height: 4px;
    background-color: var(--color-primary-val);
    border-radius: 2px;
    z-index: 2;
  }

  .thumb {
    position: absolute;
    width: 100%;
    pointer-events: none;
    appearance: none;
    background: none;
    z-index: 3;
    outline: none;
    margin: 0;
  }

  /* Universal thumb styling matching app.css */
  .thumb::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary-val);
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  .thumb::-moz-range-thumb {
    appearance: none;
    pointer-events: auto;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary-val);
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  /* Ensure inputs are transparent so they don't block the track */
  .thumb::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }
  
  .thumb::-moz-range-track {
    background: transparent;
    border: none;
  }
</style>
