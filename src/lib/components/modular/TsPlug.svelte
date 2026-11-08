<script lang="ts">
  let {
    color = 'var(--color-primary)',
    inserted = false,
    class: className = ''
  }: {
    color?: string;
    inserted?: boolean;
    class?: string;
  } = $props();

  const width = $derived(inserted ? 22 : 38);
  const viewBox = $derived(inserted ? '0 0 22 16' : '0 0 38 16');
</script>

<svg
  {width}
  height="16"
  {viewBox}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="select-none {className}"
  overflow="visible"
>
  <!-- Rubber strain relief boot (cable entry) -->
  <rect
    x="0"
    y="5.5"
    width="2.5"
    height="5"
    rx="0.8"
    class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
    stroke-width="0.6"
  />
  <rect
    x="2.5"
    y="4.5"
    width="2.5"
    height="7"
    rx="0.8"
    class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
    stroke-width="0.6"
  />

  <!-- Plug barrel / handle body -->
  <rect
    x="5"
    y="3"
    width="15"
    height="10"
    rx="1.5"
    fill={color}
    stroke="#1e293b"
    stroke-width="0.8"
  />

  <!-- Top highlight line on barrel -->
  <path
    d="M 6.5 4.5 L 18.5 4.5"
    stroke="rgba(255, 255, 255, 0.45)"
    stroke-width="0.8"
    stroke-linecap="round"
  />

  <!-- Barrel grip ribs -->
  <line x1="10" y1="5" x2="10" y2="11" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />
  <line x1="14" y1="5" x2="14" y2="11" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />
  <line x1="10.8" y1="5" x2="10.8" y2="11" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.6" stroke-linecap="round" />
  <line x1="14.8" y1="5" x2="14.8" y2="11" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.6" stroke-linecap="round" />

  <!-- Front metallic collar ring of barrel -->
  <rect
    x="19.5"
    y="4"
    width="2"
    height="8"
    rx="0.5"
    class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
    stroke-width="0.6"
  />

  {#if !inserted}
    <!-- Metal sleeve (shaft) -->
    <rect
      x="21.5"
      y="5.2"
      width="8"
      height="5.6"
      rx="0.3"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="0.6"
    />
    <!-- Specular highlight on sleeve -->
    <line
      x1="22"
      y1="6.3"
      x2="29"
      y2="6.3"
      stroke="#ffffff"
      stroke-width="0.7"
      opacity="0.9"
    />

    <!-- Insulator ring (black spacer) -->
    <rect
      x="29.5"
      y="5.2"
      width="1.8"
      height="5.6"
      fill="#090d16"
    />

    <!-- Metal conductive tip with neck groove -->
    <path
      d="M 31.3 5.3 C 32.2 6.1 32.8 6.2 33.6 5.8 C 35.2 5 37 6.8 37.5 8 C 37 9.2 35.2 11 33.6 10.2 C 32.8 9.8 32.2 9.9 31.3 10.7 Z"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="0.6"
      stroke-linejoin="round"
    />
    <!-- Specular highlight on tip -->
    <path
      d="M 33.5 6.4 C 34.8 5.8 36.2 7 36.6 8"
      stroke="#ffffff"
      stroke-width="0.6"
      fill="none"
      opacity="0.9"
      stroke-linecap="round"
    />
  {:else}
    <!-- Tiny metallic sleeve sliver entering the socket -->
    <rect
      x="21.5"
      y="5.2"
      width="0.5"
      height="5.6"
      class="fill-slate-200 dark:fill-slate-300"
    />
  {/if}
</svg>
