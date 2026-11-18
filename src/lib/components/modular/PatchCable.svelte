<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    calculateDragCablePath,
    calculateDroopPath,
    CableSpringAnimation
  } from '$lib/modular/cablePhysics';
  import type { CableEdgeData, XYPosition } from '$lib/modular/types';
  import TsPlug from './TsPlug.svelte';

  let {
    id,
    from,
    to,
    targetPos = null,
    data,
    color,
    isMobile = false,
    selected = false,
    dragging = false,
    scrub = 1,
    onStartReconnect
  }: {
    id?: string;
    from: XYPosition;
    to: XYPosition;
    targetPos?: XYPosition | null;
    data?: CableEdgeData;
    color?: string;
    isMobile?: boolean;
    selected?: boolean;
    dragging?: boolean;
    scrub?: number;
    onStartReconnect?: (edgeId: string, event: PointerEvent) => void;
  } = $props();

  const cableColor = $derived(color ?? data?.color ?? 'var(--color-primary)');
  const slack = $derived(data?.slack ?? 1.0);

  let dynamicOffset = $state({ x: 0, y: 0 });
  const springAnim = new CableSpringAnimation((d) => {
    dynamicOffset = d;
  });

  $effect(() => {
    springAnim.trackEndpoints(from.x, from.y, to.x, to.y);
  });

  onDestroy(() => {
    springAnim.destroy();
  });

  let isHovered = $state(false);
  let lastHoverTime = 0;

  function strumCable(event: PointerEvent, minSpeed = 1) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;

    const mx = event.movementX;
    const my = event.movementY;
    const speed = Math.hypot(mx, my);

    if (speed < minSpeed && minSpeed <= 1.5) return;

    let rawIx: number;
    let rawIy: number;

    if (speed < minSpeed && minSpeed > 1.5) {
      const proj = mx * nx + my * ny;
      const sign = proj !== 0 ? Math.sign(proj) : Math.random() > 0.5 ? 1 : -1;
      rawIx = nx * sign * minSpeed;
      rawIy = ny * sign * minSpeed;
    } else {
      const proj = mx * nx + my * ny;
      rawIx = nx * proj + mx * 0.3;
      rawIy = ny * proj + my * 0.3;
    }

    const mag = Math.hypot(rawIx, rawIy);
    if (mag < 0.01) return;
    const clamped = Math.min(9, Math.max(2.5, mag * 0.5));
    springAnim.applyImpulse2D((rawIx / mag) * clamped, (rawIy / mag) * clamped);
  }

  function handleCablePointerEnter(event: PointerEvent) {
    isHovered = true;
    strumCable(event, 6);
  }

  function handleCablePointerMove(event: PointerEvent) {
    const now = performance.now();
    if (now - lastHoverTime < 40) return;
    lastHoverTime = now;
    strumCable(event, 1.5);
  }

  function handleCablePointerLeave() {
    isHovered = false;
  }

  const hovered = $derived(!dragging && isHovered);
  const coreWidth = $derived(!dragging && selected ? 12.5 : hovered ? 10.5 : 8.5);
  const outlineWidth = $derived(coreWidth + 3.5);

  const curve = $derived(
    dragging
      ? calculateDragCablePath(from.x, from.y, to.x, to.y, {
          scrub,
          dynamicOffset,
          slack,
          targetX: targetPos?.x,
          targetY: targetPos?.y,
          vertical: isMobile
        })
      : calculateDroopPath(from.x, from.y, to.x, to.y, {
          slack,
          dynamicOffset,
          vertical: isMobile
        })
  );
</script>

{#if curve.path}
  <g class="patch-cable select-none pointer-events-none" role="group">
    <!-- Pin-anchored perspective shadow -->
    <path
      d={curve.shadowPath}
      fill="none"
      stroke="rgba(0, 0, 0, 0.13)"
      stroke-width="12"
      stroke-linecap="round"
    />

    <!-- Outer dark casing outline -->
    <path
      d={curve.path}
      fill="none"
      stroke="#1e293b"
      stroke-width={outlineWidth}
      stroke-linecap="round"
      class={!dragging ? 'transition-[stroke-width] duration-150' : undefined}
    />

    <!-- Main colored cable core -->
    <path
      {id}
      d={curve.path}
      fill="none"
      stroke={cableColor}
      stroke-width={coreWidth}
      stroke-linecap="round"
      class={!dragging
        ? `transition-[stroke-width,filter] duration-150 ${hovered ? 'brightness-125' : ''}`
        : undefined}
    />

    <!-- Cylindrical specular highlight -->
    <path
      d={curve.highlightPath}
      fill="none"
      stroke="rgba(255, 255, 255, 0.32)"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Transparent hit area for hover strumming interaction -->
    {#if !dragging}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <path
        d={curve.path}
        fill="none"
        stroke="transparent"
        stroke-width="32"
        class="pointer-events-auto cursor-pointer"
        onpointerenter={handleCablePointerEnter}
        onpointermove={handleCablePointerMove}
        onpointerleave={handleCablePointerLeave}
      />
    {/if}

    <!-- Output connector on source module (rendered in front of cable) -->
    <rect
      x={isMobile ? from.x - 11 : from.x - 7.5}
      y={isMobile ? from.y - 7.5 : from.y - 11}
      width={isMobile ? 22 : 15}
      height={isMobile ? 15 : 22}
      rx="4"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="2"
    />

    <!-- TS plug at target end (rendered after cable so cable end tucks into rubber boot) -->
    <g transform="translate({to.x}, {to.y})">
      <TsPlug
        color={cableColor}
        inserted={!dragging}
        progress={dragging ? Math.max(0, (scrub - 0.5) * 2) : undefined}
        angle={curve.plugAngleDeg}
      />
    </g>
  </g>

  <!-- Interactive anchor at target jack allowing disconnection or reconnection -->
  {#if !dragging && id}
    <circle
      cx={isMobile ? to.x : to.x - 20}
      cy={isMobile ? to.y + 20 : to.y}
      r="40"
      fill="transparent"
      class="pointer-events-auto cursor-grab active:cursor-grabbing"
      onpointerdown={(e) => onStartReconnect?.(id, e)}
      role="button"
      tabindex="0"
      aria-label="Disconnect or re-patch cable"
    />
  {/if}
{/if}
