<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useStore } from '@xyflow/svelte';
  import { calculateDroopPath, CableSpringAnimation } from '$lib/modular/cablePhysics';
  import TsPlug from './TsPlug.svelte';

  const store = useStore();

  let dynamicOffset = $state(0);
  const springAnim = new CableSpringAnimation((d) => {
    dynamicOffset = d;
  });

  // Subtle physics reaction while dragging the cable endpoint
  let prevPos: { x: number; y: number } | null = null;
  $effect(() => {
    if (!store.connection.to) return;
    const toX = store.connection.to.x;
    const toY = store.connection.to.y;
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

  const plugLength = 95; // 38 * 2.5

  const curve = $derived.by(() => {
    if (!store.connection.inProgress || !store.connection.from || !store.connection.to) {
      return null;
    }

    const fromX = store.connection.from.x;
    const fromY = store.connection.from.y;
    const toX = store.connection.to.x;
    const toY = store.connection.to.y;

    // Iteratively align boot position with the end tangent angle
    let est = calculateDroopPath(fromX, fromY, toX, toY, {
      slack: 1.0,
      dynamicOffset
    });

    let bootX = toX - plugLength * Math.cos(est.endAngle);
    let bootY = toY - plugLength * Math.sin(est.endAngle);

    est = calculateDroopPath(fromX, fromY, bootX, bootY, {
      slack: 1.0,
      dynamicOffset
    });

    bootX = toX - plugLength * Math.cos(est.endAngle);
    bootY = toY - plugLength * Math.sin(est.endAngle);

    const finalPath = calculateDroopPath(fromX, fromY, bootX, bootY, {
      slack: 1.0,
      dynamicOffset
    });

    return {
      ...finalPath,
      from: store.connection.from,
      to: store.connection.to,
      bootX,
      bootY,
      angleDeg: finalPath.endAngleDeg
    };
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
      stroke="var(--color-primary)"
      stroke-width="9"
      stroke-linecap="round"
    />

    <!-- Cable exit collar at source module -->
    <rect
      x={curve.from.x - 5}
      y={curve.from.y - 10}
      width="15"
      height="20"
      rx="4"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="1.5"
    />

    <!-- TS plug rotating with the end of the bezier curve as user drags -->
    <g transform="translate({curve.bootX}, {curve.bootY}) rotate({curve.angleDeg}) translate(0, -20)">
      <TsPlug color="var(--color-primary)" inserted={false} scale={2.5} />
    </g>
  </g>
{/if}
