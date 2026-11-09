<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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

  // Settle animation when cable is created
  onMount(() => {
    springAnim.settle(8);
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
      stroke-width={selected ? '13' : '9'}
      stroke-linecap="round"
      class="transition-[stroke-width]"
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
