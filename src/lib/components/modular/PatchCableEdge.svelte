<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { EdgeProps } from '@xyflow/svelte';
  import { calculateDroopPath, CableSpringAnimation } from '$lib/modular/cablePhysics';
  import type { CableEdge } from '$lib/modular/types';
  import TsPlug from './TsPlug.svelte';

  let {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected
  }: EdgeProps<CableEdge> = $props();

  const cableColor = $derived(data?.color ?? 'var(--color-primary)');
  const slack = $derived(data?.slack ?? 1.0);

  let dynamicOffset = $state(0);
  const springAnim = new CableSpringAnimation((d) => {
    dynamicOffset = d;
  });

  // Settle animation when cable is created
  onMount(() => {
    springAnim.settle(3);
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

  const plugInsertedLength = 22;
  const cableEndX = $derived(targetX - plugInsertedLength);
  const cableEndY = $derived(targetY);

  const curve = $derived(
    calculateDroopPath(sourceX, sourceY, cableEndX, cableEndY, {
      slack,
      dynamicOffset
    })
  );
</script>

{#if curve.path}
  <g class="patch-cable select-none pointer-events-none" role="group">
    <!-- Droop shadow -->
    <path
      d={curve.shadowPath}
      fill="none"
      stroke="rgba(0, 0, 0, 0.1)"
      stroke-width="5"
      stroke-linecap="round"
    />

    <!-- Main droopy cable -->
    <path
      {id}
      d={curve.path}
      fill="none"
      stroke={cableColor}
      stroke-width={selected ? '5' : '3.5'}
      stroke-linecap="round"
      class="transition-[stroke-width]"
    />

    <!-- Cable exit collar at source module -->
    <rect
      x={sourceX - 2}
      y={sourceY - 4}
      width="6"
      height="8"
      rx="1.5"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="0.8"
    />

    <!-- TS plug inserted into target TS jack -->
    <g transform="translate({cableEndX}, {targetY - 8})">
      <TsPlug color={cableColor} inserted={true} />
    </g>
  </g>
{/if}
