<script lang="ts">
  import { JACK_LENGTH, PLUG_SCALE } from '$lib/modular/constants';

  let {
    scale = PLUG_SCALE,
    class: className = ''
  }: {
    scale?: number;
    class?: string;
  } = $props();

  const width = $derived(JACK_LENGTH * scale);
  const height = $derived(18 * scale);
</script>

<svg
  {width}
  {height}
  viewBox="0 -9 10 18"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  overflow="visible"
  class="block select-none {className}"
>
  <!-- Panel washer / flange flush against module edge (x = 10) -->
  <rect
    x="8.4"
    y="-8.5"
    width="1.6"
    height="17"
    rx="0.4"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-700 dark:stroke-slate-500"
    stroke-width="0.6"
  />

  <!-- Hexagonal bezel nut (side profile, 3 vertical facets) -->
  <rect
    x="4.2"
    y="-7"
    width="4.2"
    height="14"
    rx="0.5"
    class="fill-slate-200 stroke-slate-400 dark:fill-slate-600 dark:stroke-slate-400"
    stroke-width="0.6"
  />
  <!-- Top facet highlight -->
  <rect
    x="4.5"
    y="-6.7"
    width="3.6"
    height="3.2"
    rx="0.2"
    fill="rgba(255, 255, 255, 0.25)"
  />
  <!-- Bottom facet shading -->
  <rect
    x="4.5"
    y="3.5"
    width="3.6"
    height="3.2"
    rx="0.2"
    fill="rgba(0, 0, 0, 0.14)"
  />
  <!-- Horizontal bevel lines between nut facets -->
  <line
    x1="4.2"
    y1="-3.3"
    x2="8.4"
    y2="-3.3"
    class="stroke-slate-400 dark:stroke-slate-400"
    stroke-width="0.6"
  />
  <line
    x1="4.2"
    y1="3.3"
    x2="8.4"
    y2="3.3"
    class="stroke-slate-400 dark:stroke-slate-400"
    stroke-width="0.6"
  />

  <!-- Threaded sleeve / bushing -->
  <rect
    x="0.3"
    y="-4.2"
    width="3.9"
    height="8.4"
    rx="0.4"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
    stroke-width="0.6"
  />
  <!-- Top specular highlight on bushing -->
  <line
    x1="1.1"
    y1="-2.7"
    x2="3.8"
    y2="-2.7"
    stroke="#ffffff"
    stroke-width="0.7"
    stroke-linecap="round"
    opacity="0.8"
  />
  <!-- Vertical thread grooves -->
  <line x1="1.6" y1="-3.8" x2="1.6" y2="3.8" stroke="rgba(0, 0, 0, 0.2)" stroke-width="0.5" />
  <line x1="2.4" y1="-3.8" x2="2.4" y2="3.8" stroke="rgba(0, 0, 0, 0.2)" stroke-width="0.5" />
  <line x1="3.2" y1="-3.8" x2="3.2" y2="3.8" stroke="rgba(0, 0, 0, 0.2)" stroke-width="0.5" />

  <!-- Socket bore aperture opening at x = 0 -->
  <rect
    x="0"
    y="-3.1"
    width="1.2"
    height="6.2"
    rx="0.3"
    class="fill-slate-950"
  />
</svg>
