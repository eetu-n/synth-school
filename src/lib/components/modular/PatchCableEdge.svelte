<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { EdgeProps } from '@xyflow/svelte';
  import { calculateDroopPath, CableSpringAnimation } from '$lib/modular/cablePhysics';
  import type { CableEdgeData } from '$lib/modular/types';

  let {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected
  }: EdgeProps = $props();

  const cableData = $derived((data ?? {}) as CableEdgeData);
  const cableColor = $derived(cableData.color ?? 'var(--color-primary)');
  const slack = $derived(cableData.slack ?? 1.0);

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

  const curve = $derived(
    calculateDroopPath(sourceX, sourceY, targetX, targetY, {
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

    <!-- Jack plug points -->
    <circle cx={sourceX} cy={sourceY} r="4" fill={cableColor} stroke="var(--color-surface, #ffffff)" stroke-width="1.5" />
    <circle cx={targetX} cy={targetY} r="4" fill={cableColor} stroke="var(--color-surface, #ffffff)" stroke-width="1.5" />
  </g>
{/if}
