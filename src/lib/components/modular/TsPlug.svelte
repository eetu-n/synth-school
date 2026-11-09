<script lang="ts">
  let {
    color = 'var(--color-primary)',
    inserted = false,
    scale = 2.5,
    animate = true,
    angle = 0,
    class: className = ''
  }: {
    color?: string;
    inserted?: boolean;
    scale?: number;
    animate?: boolean;
    angle?: number;
    class?: string;
  } = $props();

  const uid = Math.random().toString(36).slice(2, 9);
  const clipId = `plug-clip-${uid}`;

  let animKey = $state(0);
  function replay() {
    if (inserted && animate) {
      animKey++;
    }
  }

  const baseSize = $derived(inserted ? 32 : 38);
  const width = $derived(baseSize * scale);
  const height = $derived((inserted ? 32 : 16) * scale);
  const svgX = $derived(inserted ? -16 * scale : 0);
  const svgY = $derived(inserted ? -16 * scale : 0);
  const viewBox = $derived(inserted ? '-16 -16 32 32' : '0 0 38 16');
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
  class="select-none {className}"
  overflow="visible"
  onclick={replay}
>
  {#if inserted}
    <defs>
      <!-- Clip shaft at x=0 so it recedes into the jack socket -->
      <clipPath id={clipId}>
        <rect x="-100" y="-50" width="100" height="100" />
      </clipPath>
    </defs>

    {#key animKey}
      <g transform="rotate({angle})">
        <!-- 1. Rotating side-profile of plug swinging into the screen -->
        {#if animate}
          <g class="plug-rotate-side" clip-path="url(#{clipId})">
            <!-- Metallic shaft entering the jack aperture at (0, 0) -->
            <rect
              x="0"
              y="-2.8"
              width="12"
              height="5.6"
              rx="0.3"
              class="fill-slate-200 stroke-slate-400 dark:fill-slate-300 dark:stroke-slate-500"
              stroke-width="0.6"
            />
            <line
              x1="0"
              y1="-1.7"
              x2="10"
              y2="-1.7"
              stroke="#ffffff"
              stroke-width="0.7"
              opacity="0.9"
            />

            <!-- Rubber strain relief boot (leftmost cable entry) -->
            <rect
              x="-22"
              y="-2.5"
              width="2.5"
              height="5"
              rx="0.8"
              class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
              stroke-width="0.6"
            />
            <rect
              x="-19.5"
              y="-3.5"
              width="2.5"
              height="7"
              rx="0.8"
              class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
              stroke-width="0.6"
            />

            <!-- Plug barrel / handle body -->
            <rect
              x="-17"
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
              d="M -15.5 -3.5 L -3.5 -3.5"
              stroke="rgba(255, 255, 255, 0.45)"
              stroke-width="0.8"
              stroke-linecap="round"
            />

            <!-- Barrel grip ribs -->
            <line x1="-12" y1="-3" x2="-12" y2="3" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />
            <line x1="-8" y1="-3" x2="-8" y2="3" stroke="rgba(0, 0, 0, 0.25)" stroke-width="1" stroke-linecap="round" />

            <!-- Front metallic collar ring of barrel -->
            <rect
              x="-2"
              y="-4"
              width="2"
              height="8"
              rx="0.5"
              class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
              stroke-width="0.6"
            />
          </g>
        {/if}

        <!-- 2. Plug viewed from behind: rotates into view and becomes the final resting frame -->
        <g class={animate ? 'plug-rotate-rear' : ''}>
          <!-- Outer metallic collar bevel rim -->
          <circle
            cx="0"
            cy="0"
            r="7.0"
            class="fill-slate-300 stroke-slate-500 dark:fill-slate-400 dark:stroke-slate-600"
            stroke-width="0.6"
          />

          <!-- Main colored barrel cylinder (rear view) -->
          <circle
            cx="0"
            cy="0"
            r="6.0"
            fill={color}
            stroke="#1e293b"
            stroke-width="0.8"
          />

          <!-- Rubber strain relief boot (cable entry grommet) -->
          <circle
            cx="0"
            cy="0"
            r="3.5"
            class="fill-slate-700 stroke-slate-900 dark:fill-slate-800 dark:stroke-slate-950"
            stroke-width="0.6"
          />
        </g>
      </g>

      <!-- Panel drop shadow underneath plug barrel (downwards on panel) -->
      <circle cx="0" cy="1.2" r="7.2" class="fill-slate-950/40 pointer-events-none" />

      <!-- Tactile contact ring pulse when locking into the jack at (0, 0) -->
      {#if animate}
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
  {:else}
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
  {/if}
</svg>

<style>
  .plug-rotate-side {
    animation: ts-plug-turn-side 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    transform-origin: 0px 0px;
  }

  .plug-rotate-rear {
    animation: ts-plug-turn-rear 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
    transform-origin: 0px 0px;
  }

  .plug-contact-pulse {
    animation: ts-plug-pulse 0.45s ease-out forwards;
    transform-origin: 0px 0px;
  }

  @keyframes ts-plug-turn-side {
    0% {
      transform: scaleX(1) scaleY(1);
      opacity: 1;
    }
    40% {
      transform: scaleX(0.55) scaleY(1.02);
      opacity: 0.85;
    }
    60% {
      transform: scaleX(0.1) scaleY(1.04);
      opacity: 0.25;
    }
    70%, 100% {
      transform: scaleX(0) scaleY(1.05);
      opacity: 0;
      visibility: hidden;
    }
  }

  @keyframes ts-plug-turn-rear {
    0% {
      transform: translate(-18px, 0) scale(0.25, 0.85);
      opacity: 0.15;
    }
    40% {
      transform: translate(-8px, 0) scale(0.65, 0.95);
      opacity: 0.75;
    }
    65% {
      transform: translate(0px, 0) scale(1.08);
      opacity: 1;
    }
    80% {
      transform: translate(0px, 0) scale(0.95);
      opacity: 1;
    }
    90% {
      transform: translate(0px, 0) scale(1.02);
      opacity: 1;
    }
    100% {
      transform: translate(0px, 0) scale(1);
      opacity: 1;
    }
  }

  @keyframes ts-plug-pulse {
    0%, 60% {
      transform: scale(0.5);
      opacity: 0;
    }
    68% {
      transform: scale(1.1);
      opacity: 0.9;
    }
    100% {
      transform: scale(2.8);
      opacity: 0;
    }
  }
</style>