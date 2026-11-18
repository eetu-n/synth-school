<script lang="ts">
  import { untrack } from 'svelte';
  import type { ModuleNode, HandlePositions } from '$lib/modular/types';
  import {
    JACK_LENGTH,
    MOBILE_HANDLE_OFFSET_X,
    DESKTOP_CARD_MIN_WIDTH,
    MOBILE_CARD_MIN_WIDTH
  } from '$lib/modular/constants';
  import TsJack from './TsJack.svelte';
  import TsPlug from './TsPlug.svelte';

  let {
    node,
    isMobile = false,
    selected = false,
    unlocked = true,
    highlightInput = false,
    isConnectedAsSource = false,
    isDraggingFromThis = false,
    onUpdateHandles,
    onStartDrag
  }: {
    node: ModuleNode;
    isMobile?: boolean;
    selected?: boolean;
    unlocked?: boolean;
    highlightInput?: boolean;
    isConnectedAsSource?: boolean;
    isDraggingFromThis?: boolean;
    onUpdateHandles?: (id: string, handles: HandlePositions) => void;
    onStartDrag?: (nodeId: string, event: PointerEvent) => void;
  } = $props();

  let nodeEl = $state<HTMLElement | null>(null);

  const hasPlugPokingOut = $derived(unlocked && !isConnectedAsSource && !isDraggingFromThis);

  function updateHandles() {
    if (!nodeEl) return;
    const w = nodeEl.offsetWidth;
    const h = nodeEl.offsetHeight;
    const posX = node.position?.x ?? 0;
    const posY = node.position?.y ?? 0;

    if (isMobile) {
      onUpdateHandles?.(node.id, {
        source: { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY },
        target: { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY + h + JACK_LENGTH }
      });
    } else {
      onUpdateHandles?.(node.id, {
        source: { x: posX + w, y: posY + h / 2 },
        target: { x: posX - JACK_LENGTH, y: posY + h / 2 }
      });
    }
  }

  $effect(() => {
    // Re-run whenever position or layout mode changes
    node.position?.x;
    node.position?.y;
    isMobile;

    untrack(() => {
      updateHandles();
    });

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
  class:px-8={isMobile}
  class:py-6={isMobile}
  class:ring-4={selected}
  class:ring-primary={selected}
  style:min-width="{isMobile ? MOBILE_CARD_MIN_WIDTH : DESKTOP_CARD_MIN_WIDTH}px"
>
  {#if isMobile}
    <!-- Input connector on bottom left (pointing downwards) -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute pointer-events-auto cursor-default z-10"
      style="left: {MOBILE_HANDLE_OFFSET_X - 2}px; bottom: -2px; transform: translate(-100%, 50%) rotate(-90deg); transform-origin: 100% 50%;"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <TsJack showHalo={highlightInput} />
    </div>

    {#if unlocked}
      <a href={node.data.href} class="text-xl font-bold hover:underline tracking-tight pl-8">
        {node.data.title}
      </a>
    {:else}
      <span
        aria-disabled="true"
        class="text-xl font-bold tracking-tight pl-8 text-text-secondary cursor-not-allowed opacity-60"
      >
        {node.data.title}
      </span>
    {/if}

    <!-- Output plug on top left (pointing upwards) -->
    {#if hasPlugPokingOut}
      <div
        class="absolute pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter] z-10"
        style="left: {MOBILE_HANDLE_OFFSET_X - 2}px; top: -2px; transform: translateY(-50%) rotate(-90deg); transform-origin: 0% 50%;"
        onpointerdown={(e) => onStartDrag?.(node.id, e)}
        role="button"
        tabindex="0"
        aria-label="Drag patch cable from {node.data.title}"
      >
        <TsPlug color="var(--color-primary)" />
      </div>
    {/if}
  {:else}
    <!-- Input connector on left -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 pointer-events-auto cursor-default z-10"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <TsJack showHalo={highlightInput} />
    </div>

    {#if unlocked}
      <a href={node.data.href} class="text-2xl font-bold hover:underline tracking-tight">
        {node.data.title}
      </a>
    {:else}
      <span
        aria-disabled="true"
        class="text-2xl font-bold tracking-tight text-text-secondary cursor-not-allowed opacity-60"
      >
        {node.data.title}
      </span>
    {/if}

    <!-- Output plug on right poking out -->
    {#if hasPlugPokingOut}
      <div
        class="absolute left-full top-1/2 -translate-y-1/2 flex items-center pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter] z-10"
        onpointerdown={(e) => onStartDrag?.(node.id, e)}
        role="button"
        tabindex="0"
        aria-label="Drag patch cable from {node.data.title}"
      >
        <TsPlug color="var(--color-primary)" />
      </div>
    {/if}
  {/if}
</div>
