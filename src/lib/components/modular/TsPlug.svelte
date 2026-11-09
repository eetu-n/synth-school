<script lang="ts">
  let {
    color = 'var(--color-primary)',
    inserted = false,
    scale = 2.5,
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

  const uid = Math.random().toString(36).slice(2, 9);
  const clipId = `plug-clip-${uid}`;

  let animKey = $state(0);
  function replay() {
    if (inserted && animate) {
      animKey++;
    }
  }

  // Determine effective progress p (0 = uninserted profile, 1 = inserted rear view)
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

  // Animation values derived smoothly from p
  // 1. Shaft sliding into jack aperture (length of shaft is 16 units)
  const slideX = $derived(16 * p);

  // 2. Barrel perspective foreshortening as plug turns into panel
  const barrelScaleX = $derived(Math.max(0, 1 - Math.pow(p, 1.2)));
  const sideOpacity = $derived(Math.max(0, 1 - Math.pow(p, 1.5)));

  // 3. Rear circular face swinging into view centered at (0, 0)
  const rearX = $derived(-32.5 * Math.pow(1 - p, 1.4));
  const rearScaleX = $derived(0.25 + 0.75 * Math.sin((p * Math.PI) / 2));
  const rearScaleY = $derived(0.85 + 0.15 * Math.sin((p * Math.PI) / 2));
  const rearOpacity = $derived(Math.min(1, Math.pow(p, 1.2) * 1.5));

  // 4. Contact shadow and pulse trigger at full insertion
  const shadowOpacity = $derived(Math.pow(p, 2));
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
  class="select-none {className}"
  overflow="visible"
  onclick={replay}
>
  {#if !isDynamic}
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
  {:else}
    <defs>
      <!-- Clip shaft at x=0 so it recedes into the jack socket -->
      <clipPath id={clipId}>
        <rect x="-100" y="-50" width="100" height="100" />
      </clipPath>
    </defs>

    <g transform="rotate({angle})">
      <!-- 1. Side profile transitioning into the jack aperture -->
      {#if sideOpacity > 0.005}
        <g
          transform="translate({slideX}, 0)"
          style="opacity: {sideOpacity};"
          clip-path="url(#{clipId})"
        >
          <!-- Barrel & strain relief boot (foreshortens towards collar front at x = -16) -->
          <g transform="translate(-16, 0) scale({barrelScaleX}, 1) translate(16, 0)">
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
          </g>

          <!-- Metal sleeve (shaft) sliding straight into socket -->
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
        </g>
      {/if}

      <!-- 2. Plug viewed from behind: rotates into view and becomes the final resting frame -->
      {#if rearOpacity > 0.005}
        <g
          transform="translate({rearX}, 0) scale({rearScaleX}, {rearScaleY})"
          style="opacity: {rearOpacity};"
        >
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
      {/if}
    </g>

    <!-- Panel drop shadow underneath plug barrel (downwards on panel) -->
    <circle
      cx="0"
      cy="1.2"
      r="7.2"
      class="fill-slate-950/40 pointer-events-none"
      style="opacity: {shadowOpacity};"
    />

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