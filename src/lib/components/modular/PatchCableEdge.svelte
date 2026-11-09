<script lang="ts">
  import { onDestroy } from 'svelte';
  import { calculateDroopPath, CableSpringAnimation } from '$lib/modular/cablePhysics';
  import type { CableEdgeData } from '$lib/modular/types';
  import TsPlug from './TsPlug.svelte';

  let {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected = false,
    reconnecting = false,
    onStartReconnect
  }: {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    data?: CableEdgeData;
    selected?: boolean;
    reconnecting?: boolean;
    onStartReconnect?: (edgeId: string, event: PointerEvent) => void;
  } = $props();

  const cableColor = $derived(data?.color ?? 'var(--color-primary)');
  const slack = $derived(data?.slack ?? 1.0);

  let dynamicOffset = $state(0);
  const springAnim = new CableSpringAnimation((d) => {
    dynamicOffset = d;
  });

  // React subtly when the connected modules are moved
  let prevCoords: { sx: number; sy: number; tx: number; ty: number } | null = null;
  $effect(() => {
    const sx = sourceX;
    const sy = sourceY;
    const tx = targetX;
    const ty = targetY;

    if (prevCoords !== null) {
      const dx = (sx - prevCoords.sx) + (tx - prevCoords.tx);
      const dy = (sy - prevCoords.sy) + (ty - prevCoords.ty);
      const movement = Math.sqrt(dx * dx + dy * dy);
      springAnim.applyImpulse(dy, movement);
    }
    prevCoords = { sx, sy, tx, ty };
  });

  onDestroy(() => {
    springAnim.destroy();
  });

  let isHovered = $state(false);
  let lastHoverTime = 0;

  function handleCablePointerEnter(event: PointerEvent) {
    isHovered = true;
    const dy = event.movementY !== 0 ? event.movementY : (Math.random() > 0.5 ? 3 : -3);
    const speed = Math.hypot(event.movementX, event.movementY);
    springAnim.applyImpulse(dy, Math.max(6, speed));
  }

  function handleCablePointerMove(event: PointerEvent) {
    const now = performance.now();
    if (now - lastHoverTime < 40) return;
    lastHoverTime = now;

    const speed = Math.hypot(event.movementX, event.movementY);
    if (speed > 1) {
      const dy = event.movementY !== 0 ? event.movementY : 2;
      springAnim.applyImpulse(dy, speed);
    }
  }

  function handleCablePointerLeave() {
    isHovered = false;
  }

  const curve = $derived(
    calculateDroopPath(sourceX, sourceY, targetX, targetY, {
      slack,
      dynamicOffset
    })
  );
</script>

{#if curve.path && !reconnecting}
  <g class="patch-cable select-none pointer-events-none" role="group">
    <!-- Droop shadow -->
    <path
      d={curve.shadowPath}
      fill="none"
      stroke="rgba(0, 0, 0, 0.1)"
      stroke-width="12"
      stroke-linecap="round"
    />

    <!-- TS plug inserted into target TS jack (behind the cable in Z axis) -->
    <g transform="translate({targetX}, {targetY})">
      <TsPlug color={cableColor} inserted={true} scale={2.5} angle={curve.endAngleDeg} />
    </g>

    <!-- Main droopy cable -->
    <path
      {id}
      d={curve.path}
      fill="none"
      stroke={cableColor}
      stroke-width={selected ? '13' : isHovered ? '11' : '9'}
      stroke-linecap="round"
      class="transition-[stroke-width,filter] duration-150 {isHovered ? 'brightness-125' : ''}"
    />

    <!-- Transparent hit area for hover strumming interaction -->
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

    <!-- Output connector on source module (rendered in front of cable) -->
    <rect
      x={sourceX - 7.5}
      y={sourceY - 11}
      width="15"
      height="22"
      rx="4"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="2"
    />
  </g>

  <!-- Interactive anchor at target jack allowing disconnection or reconnection -->
  <circle
    cx={targetX}
    cy={targetY}
    r="35"
    fill="transparent"
    class="pointer-events-auto cursor-grab active:cursor-grabbing"
    onpointerdown={(e) => onStartReconnect?.(id, e)}
    role="button"
    tabindex="0"
    aria-label="Disconnect or re-patch cable"
  />
{/if}
