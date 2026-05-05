<script lang="ts">
  let {
    value = $bindable(0),
    min = 0,
    max = 1,
    step = 0.01,
    label = "",
    size = 64,
    scale = "linear", // "linear" | "log" | "exp"
    exponent = 2,     // Used if scale is "exp"
    unit = "",
  } = $props();

  let isDragging = $state(false);
  let startY = $state(0);
  let startPercent = $state(0);

  const range = $derived(max - min);
  
  function valueToPercent(v: number) {
    const clampedV = Math.max(min, Math.min(max, v));
    if (scale === "log") {
      const safeMin = min <= 0 ? 0.1 : min;
      return Math.log(Math.max(safeMin, clampedV) / safeMin) / Math.log(max / safeMin);
    } else if (scale === "exp") {
      return Math.pow((clampedV - min) / range, 1 / exponent);
    }
    return (clampedV - min) / range;
  }

  function percentToValue(p: number) {
    const clampedP = Math.max(0, Math.min(1, p));
    if (scale === "log") {
      const safeMin = min <= 0 ? 0.1 : min;
      return safeMin * Math.pow(max / safeMin, clampedP);
    } else if (scale === "exp") {
      return min + Math.pow(clampedP, exponent) * range;
    }
    return min + clampedP * range;
  }

  // Percent [0, 1] for visual display
  const percent = $derived(valueToPercent(value));
  
  // Rotation for the pointer (7:30 to 4:30)
  const rotation = $derived(percent * 270 - 135);

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    startY = e.clientY;
    startPercent = valueToPercent(value);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const sensitivity = 0.002; 
    let newPercent = Math.max(0, Math.min(1, startPercent + (deltaY * sensitivity)));
    
    let newValue = percentToValue(newPercent);
    newValue = Math.round(newValue / step) * step;
    value = Math.max(min, Math.min(max, newValue));
  }

  function handlePointerUp() {
    isDragging = false;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY;
    const direction = delta > 0 ? 1 : -1;
    
    let currentP = valueToPercent(value);
    let newP = Math.max(0, Math.min(1, currentP + (direction * 0.01)));
    let newValue = percentToValue(newP);
    
    newValue = Math.round(newValue / step) * step;
    value = Math.max(min, Math.min(max, newValue));
  }

  function handleKeyDown(e: KeyboardEvent) {
    let direction = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") direction = 1;
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") direction = -1;

    if (direction !== 0) {
      e.preventDefault();
      let currentP = valueToPercent(value);
      let newP = Math.max(0, Math.min(1, currentP + (direction * 0.01)));
      let newValue = percentToValue(newP);
      newValue = Math.round(newValue / step) * step;
      value = Math.max(min, Math.min(max, newValue));
    }
  }
</script>

<div class="flex flex-col items-center gap-1 select-none" style="width: {size}px;">
  {#if label}
    <span id="knob-label-{label}" class="text-[10px] uppercase font-black tracking-wider text-base-content/40 leading-none mb-1 text-center">{label}</span>
  {/if}
  
  <div 
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-labelledby={label ? `knob-label-${label}` : undefined}
    tabindex="0"
    class="relative cursor-ns-resize group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
    style="width: {size}px; height: {size}px;"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onwheel={handleWheel}
    onkeydown={handleKeyDown}
  >
    <!-- Background Track (270 deg) -->
    <svg viewBox="0 0 100 100" class="w-full h-full transform rotate-[135deg] overflow-visible">
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        class="text-base-300"
        stroke-dasharray="197.9 65.9"
        stroke-linecap="round"
      />
      <!-- Active Track -->
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="currentColor"
        stroke-width="12"
        class="text-primary transition-all duration-75"
        stroke-dasharray="197.9 263.8"
        stroke-dashoffset={197.9 * (1 - percent)}
        stroke-linecap="round"
      />
    </svg>

    <!-- Knob Face -->
    <div 
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div 
        class="w-[78%] h-[78%] bg-base-100 rounded-full shadow-md border-2 border-base-300 flex items-center justify-center transition-transform duration-75"
        style="transform: rotate({rotation}deg);"
      >
        <!-- Pointer line -->
        <div class="absolute top-1 w-1 h-3 bg-primary rounded-full"></div>
      </div>
    </div>
  </div>

  <span class="text-[10px] font-mono font-bold text-base-content/60 bg-base-300/30 px-1.5 py-0.5 rounded leading-none mt-1">
    {step < 1 ? value.toFixed(2) : Math.round(value)}{unit ? ` ${unit}` : ''}
  </span>
</div>

<style>
  div {
    touch-action: none;
  }
</style>
