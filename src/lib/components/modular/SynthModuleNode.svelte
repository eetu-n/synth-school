<script lang="ts">
  import type { ModuleNode, HandlePositions } from '$lib/modular/types';
  import TsJack from './TsJack.svelte';
  import TsPlug from './TsPlug.svelte';

  let {
    node,
    selected = false,
    isConnectedAsSource = false,
    isDraggingFromThis = false,
    onUpdateHandles,
    onStartDrag
  }: {
    node: ModuleNode;
    selected?: boolean;
    isConnectedAsSource?: boolean;
    isDraggingFromThis?: boolean;
    onUpdateHandles?: (id: string, handles: HandlePositions) => void;
    onStartDrag?: (nodeId: string, event: PointerEvent) => void;
  } = $props();

  let nodeEl = $state<HTMLElement | null>(null);

  const isMobile = $derived(Boolean(node.data?.isMobile));
  const hasPlugPokingOut = $derived(!isConnectedAsSource && !isDraggingFromThis);

  function updateHandles() {
    if (!nodeEl) return;
    const w = nodeEl.offsetWidth;
    const h = nodeEl.offsetHeight;
    const posX = node.position?.x ?? 0;
    const posY = node.position?.y ?? 0;

    if (isMobile) {
      onUpdateHandles?.(node.id, {
        source: { x: posX + 48, y: posY },
        target: { x: posX + 48, y: posY + h }
      });
    } else {
      onUpdateHandles?.(node.id, {
        source: { x: posX + w, y: posY + h / 2 },
        target: { x: posX, y: posY + h / 2 }
      });
    }
  }

  $effect(() => {
    // Re-run whenever position or layout mode changes
    node.position?.x;
    node.position?.y;
    isMobile;

    updateHandles();

    if (!nodeEl) return;
    const observer = new ResizeObserver(() => {
      updateHandles();
    });
    observer.observe(nodeEl);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={nodeEl}
  class="rounded-3xl border-2 border-border bg-surface text-text-primary shadow-md select-none relative flex items-center justify-between gap-8"
  class:px-12={!isMobile}
  class:py-7={!isMobile}
  class:min-w-[325px]={!isMobile}
  class:px-8={isMobile}
  class:py-6={isMobile}
  class:min-w-[260px]={isMobile}
  class:ring-4={selected}
  class:ring-primary={selected}
>
  {#if isMobile}
    <!-- Input connector on bottom left -->
    <div
      class="absolute left-[48px] bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-auto cursor-default z-10"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <TsJack size={55} />
    </div>

    <a href={node.data.href} class="text-xl font-bold hover:underline tracking-tight pl-8">
      {node.data.title}
    </a>

    <!-- Output plug on top left (pointing upwards) -->
    {#if hasPlugPokingOut}
      <div
        class="absolute left-[48px] top-0 pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter] z-10"
        style="transform: rotate(-90deg); transform-origin: 0px 20px;"
        onpointerdown={(e) => onStartDrag?.(node.id, e)}
        role="button"
        tabindex="0"
        aria-label="Drag patch cable from {node.data.title}"
      >
        <TsPlug color="var(--color-primary)" scale={2.5} />
      </div>
    {/if}
  {:else}
    <!-- Input connector on left -->
    <div
      class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-default z-10"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <TsJack size={55} />
    </div>

    <a href={node.data.href} class="text-2xl font-bold hover:underline tracking-tight">
      {node.data.title}
    </a>

    <!-- Output plug on right poking out -->
    {#if hasPlugPokingOut}
      <div
        class="absolute left-full top-1/2 -translate-y-1/2 flex items-center pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter] z-10"
        onpointerdown={(e) => onStartDrag?.(node.id, e)}
        role="button"
        tabindex="0"
        aria-label="Drag patch cable from {node.data.title}"
      >
        <TsPlug color="var(--color-primary)" scale={2.5} />
      </div>
    {/if}
  {/if}
</div>
