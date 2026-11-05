<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useStore } from '@xyflow/svelte';
  import { calculateDroopPath, CableSpringAnimation } from '$lib/modular/cablePhysics';

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

  const curve = $derived.by(() => {
    if (!store.connection.inProgress || !store.connection.from || !store.connection.to) {
      return null;
    }
    return {
      ...calculateDroopPath(
        store.connection.from.x,
        store.connection.from.y,
        store.connection.to.x,
        store.connection.to.y,
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

    <!-- Jack plug endpoints -->
    <circle
      cx={curve.from.x}
      cy={curve.from.y}
      r="4"
      fill="var(--color-primary)"
      stroke="var(--color-surface, #ffffff)"
      stroke-width="1.5"
    />
    <circle
      cx={curve.to.x}
      cy={curve.to.y}
      r="4"
      fill="var(--color-primary)"
      stroke="var(--color-surface, #ffffff)"
      stroke-width="1.5"
    />
  </g>
{/if}
