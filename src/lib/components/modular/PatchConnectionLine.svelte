<script lang="ts">
  import { onDestroy } from 'svelte';
  import { calculateDragCablePath, CableSpringAnimation } from '$lib/modular/cablePhysics';
  import type { XYPosition } from '$lib/modular/types';
  import { PLUG_SCALE } from '$lib/modular/constants';
  import TsPlug from './TsPlug.svelte';

  let {
    from,
    to,
    targetPos = null,
    color = 'var(--color-primary)',
    scrub = 0
  }: {
    from: XYPosition;
    to: XYPosition;
    targetPos?: XYPosition | null;
    color?: string;
    scrub?: number;
  } = $props();

  let dynamicOffset = $state(0);
  const springAnim = new CableSpringAnimation((d) => {
    dynamicOffset = d;
  });

  // Subtle physics reaction while dragging the cable endpoint
  let prevPos: { x: number; y: number } | null = null;
  $effect(() => {
    const toX = to.x;
    const toY = to.y;
    if (prevPos !== null) {
      const dx = toX - prevPos.x;
      const dy = toY - prevPos.y;
      const movement = Math.sqrt(dx * dx + dy * dy);
      springAnim.applyImpulse(dy, movement);
    }
    prevPos = { x: toX, y: toY };
  });

  onDestroy(() => {
    springAnim.destroy();
  });

  const curve = $derived.by(() => {
    if (!from || !to) {
      return null;
    }
    return calculateDragCablePath(from.x, from.y, to.x, to.y, {
      scrub,
      dynamicOffset,
      slack: 1.0,
      targetX: targetPos?.x,
      targetY: targetPos?.y
    });
  });
</script>

{#if curve && curve.path}
  <g class="patch-cable pointer-events-none select-none" role="group">
    <!-- Droop shadow -->
    <path
      d={curve.shadowPath}
      fill="none"
      stroke="rgba(0, 0, 0, 0.1)"
      stroke-width="12"
      stroke-linecap="round"
    />

    <!-- Main droopy cable -->
    <path
      d={curve.path}
      fill="none"
      stroke={color}
      stroke-width="9"
      stroke-linecap="round"
    />

    <!-- Output connector on source module (rendered in front of cable) -->
    <rect
      x={from.x - 7.5}
      y={from.y - 11}
      width="15"
      height="22"
      rx="4"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="2"
    />

    <!-- TS plug rotating with the end of the bezier curve as user drags, with scrubbable insertion -->
    <g transform="translate({curve.tipX}, {curve.tipY})">
      <TsPlug {color} scale={PLUG_SCALE} progress={scrub} angle={curve.plugAngleDeg} />
    </g>
  </g>
{/if}
