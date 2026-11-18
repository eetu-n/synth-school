<script lang="ts">
  import { JACK_LENGTH } from '$lib/modular/constants';

  let {
    class: className = ''
  }: {
    class?: string;
  } = $props();

  const width = JACK_LENGTH;
  const height = 45;
</script>

<svg
  {width}
  {height}
  viewBox="0 -22.5 25 45"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  overflow="visible"
  class="block select-none {className}"
>
  <!-- Panel washer / flange flush against module edge (x = 25) -->
  <rect
    x="21"
    y="-21"
    width="4"
    height="42"
    rx="1"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-700 dark:stroke-slate-500"
    stroke-width="1.5"
  />

  <!-- Hexagonal bezel nut (side profile, 3 vertical facets) -->
  <rect
    x="10.5"
    y="-17.5"
    width="10.5"
    height="35"
    rx="1.25"
    class="fill-slate-200 stroke-slate-400 dark:fill-slate-600 dark:stroke-slate-400"
    stroke-width="1.5"
  />
  <!-- Top facet highlight -->
  <rect
    x="11.25"
    y="-16.75"
    width="9"
    height="8"
    rx="0.5"
    fill="rgba(255, 255, 255, 0.25)"
  />
  <!-- Bottom facet shading -->
  <rect
    x="11.25"
    y="8.75"
    width="9"
    height="8"
    rx="0.5"
    fill="rgba(0, 0, 0, 0.14)"
  />
  <!-- Horizontal bevel lines between nut facets -->
  <line
    x1="10.5"
    y1="-8.25"
    x2="21"
    y2="-8.25"
    class="stroke-slate-400 dark:stroke-slate-400"
    stroke-width="1.5"
  />
  <line
    x1="10.5"
    y1="8.25"
    x2="21"
    y2="8.25"
    class="stroke-slate-400 dark:stroke-slate-400"
    stroke-width="1.5"
  />

  <!-- Threaded sleeve / bushing -->
  <rect
    x="0.75"
    y="-10.5"
    width="9.75"
    height="21"
    rx="1"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
    stroke-width="1.5"
  />
  <!-- Top specular highlight on bushing -->
  <line
    x1="2.75"
    y1="-6.75"
    x2="9.5"
    y2="-6.75"
    stroke="#ffffff"
    stroke-width="1.75"
    stroke-linecap="round"
    opacity="0.8"
  />
  <!-- Vertical thread grooves -->
  <line x1="4" y1="-9.5" x2="4" y2="9.5" stroke="rgba(0, 0, 0, 0.2)" stroke-width="1.25" />
  <line x1="6" y1="-9.5" x2="6" y2="9.5" stroke="rgba(0, 0, 0, 0.2)" stroke-width="1.25" />
  <line x1="8" y1="-9.5" x2="8" y2="9.5" stroke="rgba(0, 0, 0, 0.2)" stroke-width="1.25" />

  <!-- Socket bore aperture opening at x = 0 -->
  <rect
    x="0"
    y="-7.75"
    width="3"
    height="15.5"
    rx="0.75"
    class="fill-slate-950"
  />
</svg>
