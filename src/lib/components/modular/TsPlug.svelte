<script lang="ts">
  import { PLUG_LENGTH, PLUG_SCALE, PLUG_SHAFT_LENGTH } from '$lib/modular/constants';

  let {
    color = 'var(--color-primary)',
    inserted = false,
    scale = PLUG_SCALE,
    animate = true,
    angle = 0,
    progress = undefined,
    class: className = ''
  }: {
    color?: string;
    inserted?: boolean;
    scale?: number;
    animate?: boolean;
    angle?: number;
    progress?: number;
    class?: string;
  } = $props();

  const uid = $props.id();
  const clipId = `plug-clip-${uid}`;

  let animKey = $state(0);
  function replay() {
    if (inserted && animate) {
      animKey++;
    }
  }

  // Determine effective insertion progress p (0 = outside jack, 1 = fully seated in jack)
  const isDynamic = $derived(progress !== undefined || inserted);
  const p = $derived(
    progress !== undefined
      ? Math.max(0, Math.min(1, progress))
      : inserted
        ? 1
        : 0
  );

  let wasInserted = $state(false);
  $effect(() => {
    const fullyIn = p >= 0.98;
    if (fullyIn && !wasInserted && animate) {
      animKey++;
    }
    wasInserted = fullyIn;
  });

  const width = $derived((!isDynamic ? 38 : 62) * scale);
  const height = $derived((!isDynamic ? 16 : 40) * scale);
  const svgX = $derived(!isDynamic ? 0 : -42 * scale);
  const svgY = $derived(!isDynamic ? 0 : -20 * scale);
  const viewBox = $derived(!isDynamic ? '0 0 38 16' : '-42 -20 62 40');

  const slideX = $derived(PLUG_SHAFT_LENGTH * p);
  const isFullyInserted = $derived(p >= 0.98);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
  x={svgX}
  y={svgY}
  {width}
  {height}
  {viewBox}
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="block select-none {className}"
  overflow="visible"
  onclick={replay}
>
  {#snippet sideProfile()}
    <!-- Rubber strain relief boot (cable entry) -->
    <rect
      x="-37.5"
      y="-2.5"
      width="2.5"
      height="5"
      rx="0.8"
      class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
      stroke-width="0.6"
    />
    <rect
      x="-35"
      y="-3.5"
      width="2.5"
      height="7"
      rx="0.8"
      class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
      stroke-width="0.6"
    />

    <!-- Plug barrel / handle body -->
    <rect
      x="-32.5"
      y="-5"
      width="15"
      height="10"
      rx="1.5"
      fill={color}
      stroke="#1e293b"
      stroke-width="0.8"
    />

    <!-- Barrel top highlight -->
    <path
      d="M -31 -3.5 L -19 -3.5"
      stroke="rgba(255, 255, 255, 0.45)"
      stroke-width="0.8"
      stroke-linecap="round"
    />

    <!-- Barrel grip ribs -->
    <line x1="-27.5" y1="-3" x2="-27.5" y2="3" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />
    <line x1="-23.5" y1="-3" x2="-23.5" y2="3" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />
    <line x1="-26.7" y1="-3" x2="-26.7" y2="3" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.6" stroke-linecap="round" />
    <line x1="-22.7" y1="-3" x2="-22.7" y2="3" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.6" stroke-linecap="round" />

    <!-- Front metallic collar ring of barrel -->
    <rect
      x="-18"
      y="-4"
      width="2"
      height="8"
      rx="0.5"
      class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
      stroke-width="0.6"
    />

    <!-- Metal sleeve (shaft) -->
    <rect
      x="-16"
      y="-2.8"
      width="8"
      height="5.6"
      rx="0.3"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="0.6"
    />
    <!-- Specular highlight on sleeve -->
    <line
      x1="-15.5"
      y1="-1.7"
      x2="-8.5"
      y2="-1.7"
      stroke="#ffffff"
      stroke-width="0.7"
      opacity="0.9"
    />

    <!-- Insulator ring (black spacer) -->
    <rect
      x="-8"
      y="-2.8"
      width="1.8"
      height="5.6"
      fill="#090d16"
    />

    <!-- Metal conductive tip with neck groove -->
    <path
      d="M -6.2 -2.7 C -5.3 -1.9 -4.7 -1.8 -3.9 -2.2 C -2.3 -3 -0.5 -1.2 0 0 C -0.5 1.2 -2.3 3 -3.9 2.2 C -4.7 1.8 -5.3 1.9 -6.2 2.7 Z"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="0.6"
      stroke-linejoin="round"
    />
    <!-- Specular highlight on tip -->
    <path
      d="M -4 -1.6 C -2.7 -2.2 -1.3 -1 -0.9 0"
      stroke="#ffffff"
      stroke-width="0.6"
      fill="none"
      opacity="0.9"
      stroke-linecap="round"
    />
  {/snippet}

  {#if !isDynamic}
    <g transform="translate({PLUG_LENGTH}, 8)">
      {@render sideProfile()}
    </g>
  {:else}
    <defs>
      <!-- Clip shaft at x=0.5 so it slides inside the jack's bore aperture -->
      <clipPath id={clipId}>
        <rect x="-100" y="-50" width="100.5" height="100" />
      </clipPath>
    </defs>

    <g transform="rotate({angle})">
      <g clip-path="url(#{clipId})">
        <g transform="translate({slideX}, 0)">
          {@render sideProfile()}
        </g>
      </g>
    </g>

    <!-- Tactile contact ring pulse when locking into the jack at (0, 0) -->
    {#key animKey}
      {#if isFullyInserted && animate}
        <circle
          cx="0"
          cy="0"
          r="5"
          fill="none"
          stroke={color}
          stroke-width="1.2"
          class="plug-contact-pulse pointer-events-none"
        />
      {/if}
    {/key}
  {/if}
</svg>

<style>
  .plug-contact-pulse {
    animation: ts-plug-pulse 0.45s ease-out forwards;
    transform-origin: 0px 0px;
  }

  @keyframes ts-plug-pulse {
    0% {
      transform: scale(0.5);
      opacity: 0.9;
    }
    100% {
      transform: scale(2.8);
      opacity: 0;
    }
  }
</style>
