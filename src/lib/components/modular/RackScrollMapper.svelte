<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useStore } from '@xyflow/svelte';

  let {
    rackWidth = 0,
    containerWidth = 0,
    disabled = false
  }: {
    rackWidth: number;
    containerWidth: number;
    disabled?: boolean;
  } = $props();

  const store = useStore();
  let cleanup: (() => void) | null = null;

  // Keep viewport horizontally locked at 0 on mobile, vertically locked at 0 on desktop
  $effect(() => {
    if (disabled) {
      if (store.viewport.x !== 0 && store.panZoom) {
        store.panZoom.setViewport({
          x: 0,
          y: store.viewport.y,
          zoom: 1
        });
      }
    } else {
      if (store.viewport.y !== 0 && store.panZoom) {
        store.panZoom.setViewport({
          x: store.viewport.x,
          y: 0,
          zoom: 1
        });
      }
    }
  });

  onMount(() => {
    if (disabled) return;
    const domNode = store.domNode;
    if (!domNode) return;

    function handleWheel(e: WheelEvent) {
      if (disabled) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 2) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
        const currentX = store.viewport.x;
        const maxScroll = Math.max(0, rackWidth - containerWidth);
        const nextX = Math.min(0, Math.max(-maxScroll, currentX - delta));

        store.panZoom?.setViewport({
          x: nextX,
          y: 0,
          zoom: 1
        });
      }
    }

    domNode.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    cleanup = () => {
      domNode.removeEventListener('wheel', handleWheel, { capture: true });
    };
  });

  onDestroy(() => {
    cleanup?.();
  });
</script>
