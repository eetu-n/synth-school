<script lang="ts">
  import { PLUG_LENGTH, PLUG_SHAFT_LENGTH } from '$lib/modular/constants';

  let {
    color = 'var(--color-primary)',
    inserted = false,
    animate = true,
    angle = 0,
    progress = undefined,
    class: className = ''
  }: {
    color?: string;
    inserted?: boolean;
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

  const width = $derived(!isDynamic ? 95 : 155);
  const height = $derived(!isDynamic ? 40 : 100);
  const svgX = $derived(!isDynamic ? 0 : -105);
  const svgY = $derived(!isDynamic ? 0 : -50);
  const viewBox = $derived(!isDynamic ? '0 0 95 40' : '-105 -50 155 100');

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
      x="-94"
      y="-6"
      width="6"
      height="12"
      rx="2"
      class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
      stroke-width="1.5"
    />
    <rect
      x="-88"
      y="-9"
      width="6"
      height="18"
      rx="2"
      class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
      stroke-width="1.5"
    />

    <!-- Plug barrel / handle body -->
    <rect
      x="-82"
      y="-12.5"
      width="38"
      height="25"
      rx="4"
      fill={color}
      stroke="#1e293b"
      stroke-width="2"
    />

    <!-- Barrel top highlight -->
    <path
      d="M -78 -9 L -48 -9"
      stroke="rgba(255, 255, 255, 0.45)"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Barrel grip ribs -->
    <line x1="-69" y1="-7.5" x2="-69" y2="7.5" stroke="rgba(0, 0, 0, 0.25)" stroke-width="2.5" stroke-linecap="round" />
    <line x1="-59" y1="-7.5" x2="-59" y2="7.5" stroke="rgba(0, 0, 0, 0.25)" stroke-width="2.5" stroke-linecap="round" />
    <line x1="-67" y1="-7.5" x2="-67" y2="7.5" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5" stroke-linecap="round" />
    <line x1="-57" y1="-7.5" x2="-57" y2="7.5" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.5" stroke-linecap="round" />

    <!-- Front metallic collar ring of barrel -->
    <rect
      x="-45"
      y="-10"
      width="5"
      height="20"
      rx="1.25"
      class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
      stroke-width="1.5"
    />

    <!-- Metal sleeve (shaft) -->
    <rect
      x="-40"
      y="-7"
      width="20"
      height="14"
      rx="0.75"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="1.5"
    />
    <!-- Specular highlight on sleeve -->
    <line
      x1="-39"
      y1="-4.25"
      x2="-21"
      y2="-4.25"
      stroke="#ffffff"
      stroke-width="1.75"
      opacity="0.9"
    />

    <!-- Insulator ring (black spacer) -->
    <rect
      x="-20"
      y="-7"
      width="4.5"
      height="14"
      fill="#090d16"
    />

    <!-- Metal conductive tip with neck groove -->
    <path
      d="M -15.5 -6.75 C -13.25 -4.75 -11.75 -4.5 -9.75 -5.5 C -5.75 -7.5 -1.25 -3 0 0 C -1.25 3 -5.75 7.5 -9.75 5.5 C -11.75 4.5 -13.25 4.75 -15.5 6.75 Z"
      class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <!-- Specular highlight on tip -->
    <path
      d="M -10 -4 C -6.75 -5.5 -3.25 -2.5 -2.25 0"
      stroke="#ffffff"
      stroke-width="1.5"
      fill="none"
      opacity="0.9"
      stroke-linecap="round"
    />
  {/snippet}

  {#if !isDynamic}
    <g transform="translate({PLUG_LENGTH}, 20)">
      {@render sideProfile()}
    </g>
  {:else}
    <defs>
      <!-- Clip shaft at x=1 so it slides inside the jack's bore aperture -->
      <clipPath id={clipId}>
        <rect x="-250" y="-125" width="251" height="250" />
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
          r="12.5"
          fill="none"
          stroke={color}
          stroke-width="3"
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
