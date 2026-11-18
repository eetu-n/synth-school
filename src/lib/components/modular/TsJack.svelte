<script lang="ts">
  import { JACK_LENGTH } from '$lib/modular/constants';

  let {
    showHalo = false,
    class: className = ''
  }: {
    showHalo?: boolean;
    class?: string;
  } = $props();

  const width = JACK_LENGTH;
  const height = 45;

  const uid = $props.id();
  const radialGradId = `jack-halo-grad-${uid}`;
  const maskId = `jack-halo-mask-${uid}`;

  const HALO_MASK_RADIUS = 50;
  const HALO_MASK_STEPS = 12;
  const haloMaskSectors = Array.from({ length: HALO_MASK_STEPS }, (_, step) => {
    const k = step + 1;
    const t = k / HALO_MASK_STEPS;
    const prevT = step / HALO_MASK_STEPS;
    const targetAlpha = t * t * (3 - 2 * t);
    const prevAlpha = prevT * prevT * (3 - 2 * prevT);
    const opacity = (targetAlpha - prevAlpha) / (1 - prevAlpha);

    const halfAngleRad = ((36 - step * 2) * Math.PI) / 180;
    const endX = -HALO_MASK_RADIUS * Math.cos(halfAngleRad);
    const endY = HALO_MASK_RADIUS * Math.sin(halfAngleRad);

    return {
      d: `M 0 0 L ${endX} ${-endY} A ${HALO_MASK_RADIUS} ${HALO_MASK_RADIUS} 0 0 0 ${endX} ${endY} Z`,
      opacity
    };
  });
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
  {#if showHalo}
    <defs>
      <radialGradient id={radialGradId} cx="0" cy="0" r="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
        <stop offset="55%" stop-color="#ffffff" stop-opacity="1" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-60" y="-60" width="120" height="120">
        {#each haloMaskSectors as sector, idx (idx)}
          <path d={sector.d} fill="url(#{radialGradId})" opacity={sector.opacity} />
        {/each}
      </mask>
    </defs>

    <g transform="translate(1.5, 0)" mask="url(#{maskId})" class="pointer-events-none">
      <circle r="32" fill="#fbbf24" opacity="0.16" />
      <g class="jack-halo-rays">
        {#each Array.from({ length: 24 }, (_, i) => i) as i (i)}
          {@const isLong = i % 2 === 0}
          <path
            d={isLong
              ? 'M 1.2 -0.35 L 41 -3.4 Q 43.2 0 41 3.4 L 1.2 0.35 Z'
              : 'M 1.2 -0.25 L 31 -2.3 Q 33 0 31 2.3 L 1.2 0.25 Z'}
            fill="#fbbf24"
            opacity={isLong ? 0.55 : 0.35}
            transform="rotate({i * 15})"
          />
        {/each}
      </g>
    </g>
  {/if}

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

<style>
  .jack-halo-rays {
    animation: jack-halo-spin 12s linear infinite;
    transform-origin: 0px 0px;
  }

  @keyframes jack-halo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
