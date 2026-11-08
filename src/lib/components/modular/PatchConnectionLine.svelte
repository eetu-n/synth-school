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

  const plugLength = 38;
  const cableEndX = $derived(store.connection.to ? store.connection.to.x - plugLength : 0);
  const cableEndY = $derived(store.connection.to ? store.connection.to.y : 0);

  const curve = $derived.by(() => {
    if (!store.connection.inProgress || !store.connection.from || !store.connection.to) {
      return null;
    }
    return {
      ...calculateDroopPath(
        store.connection.from.x,
        store.connection.from.y,
        cableEndX,
        cableEndY,
        {
          slack: 1.0,
          dynamicOffset
        }
      ),
      from: store.connection.from,
      to: store.connection.to
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
      stroke-width="5"
      stroke-linecap="round"
    />

    <!-- Main droopy cable -->
    <path
      d={curve.path}
      fill="none"
      stroke="var(--color-primary)"
      stroke-width="3.5"
      stroke-linecap="round"
    />

    <!-- Cable exit collar at source module -->
    <rect
      x={curve.from.x - 2}
      y={curve.from.y - 4}
      width="6"
      height="8"
      rx="1.5"
      fill="#334155"
      stroke="#1e293b"
      stroke-width="0.8"
    />

    <!-- TS plug moving with cable as user drags -->
    <g transform="translate({curve.to.x - plugLength}, {curve.to.y - 8})">
      <TsPlug color="var(--color-primary)" inserted={false} />
    </g>
  </g>
{/if}
