<script lang="ts">
  import { onDestroy } from 'svelte';
  import { useStore } from '@xyflow/svelte';
  import { calculateDroopPath, stepSpring, type SpringState } from '$lib/modular/cablePhysics';

  const store = useStore();

  let spring = $state<SpringState>({ displacement: 0, velocity: 0 });
  let animFrameId: number | null = null;

  function startPhysics() {
    if (animFrameId !== null) return;
    const tick = () => {
      if (Math.abs(spring.displacement) > 0.05 || Math.abs(spring.velocity) > 0.05) {
        spring = stepSpring(spring);
        animFrameId = requestAnimationFrame(tick);
      } else {
        spring = { displacement: 0, velocity: 0 };
        animFrameId = null;
      }
    };
    animFrameId = requestAnimationFrame(tick);
  }

  // Subtle physics reaction while dragging the cable endpoint
  let prevX = 0;
  let prevY = 0;
  $effect(() => {
    if (!store.connection.to) return;
    const toX = store.connection.to.x;
    const toY = store.connection.to.y;
    if (prevX !== 0 && prevY !== 0) {
      const dx = toX - prevX;
      const dy = toY - prevY;
      const movement = Math.sqrt(dx * dx + dy * dy);
      if (movement > 2) {
        const impulse = Math.min(1.2, movement * 0.04);
        spring = {
          displacement: spring.displacement,
          velocity: spring.velocity + (dy < 0 ? -impulse : impulse)
        };
        startPhysics();
      }
    }
    prevX = toX;
    prevY = toY;
  });

  onDestroy(() => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
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
          dynamicOffset: spring.displacement
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
