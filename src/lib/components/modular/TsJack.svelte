<script lang="ts">
  let {
    size = 55,
    class: className = ''
  }: {
    size?: number;
    class?: string;
  } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="select-none {className}"
>
  <!-- Hexagonal bezel nut -->
  <polygon
    points="12,2.5 20.23,7.25 20.23,16.75 12,21.5 3.77,16.75 3.77,7.25"
    class="fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500"
    stroke-width="1.2"
    stroke-linejoin="round"
  />

  <!-- Subtle nut bevel facet lines -->
  <line x1="12" y1="2.5" x2="12" y2="5.8" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />
  <line x1="20.23" y1="7.25" x2="17.2" y2="9" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />
  <line x1="20.23" y1="16.75" x2="17.2" y2="15" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />
  <line x1="12" y1="21.5" x2="12" y2="18.2" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />
  <line x1="3.77" y1="16.75" x2="6.8" y2="15" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />
  <line x1="3.77" y1="7.25" x2="6.8" y2="9" class="stroke-slate-300 dark:stroke-slate-600" stroke-width="0.7" />

  <!-- Inner threaded collar ring -->
  <circle
    cx="12"
    cy="12"
    r="6.2"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-600 dark:stroke-slate-400"
    stroke-width="0.8"
  />

  <!-- Jack socket aperture / hole -->
  <circle
    cx="12"
    cy="12"
    r="3.6"
    class="fill-slate-950"
  />

  <!-- Internal tip contact spring leaf -->
  <path
    d="M 10 14 C 11.2 13 12.2 10.8 13.8 11.2"
    class="stroke-slate-300 dark:stroke-slate-400"
    stroke-width="0.8"
    stroke-linecap="round"
    fill="none"
  />
</svg>
