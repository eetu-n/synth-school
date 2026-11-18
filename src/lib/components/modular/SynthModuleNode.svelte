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
  let chassisEl = $state<HTMLElement | null>(null);
  let platformEl = $state<HTMLElement | null>(null);
  let animState = $state<'idle' | 'opening' | 'closing'>('idle');
  let prevUnlocked = untrack(() => unlocked);

  const hasPlugPokingOut = $derived(unlocked && !isConnectedAsSource && !isDraggingFromThis);

  $effect(() => {
    const currentUnlocked = unlocked;
    if (currentUnlocked !== prevUnlocked) {
      animState = currentUnlocked ? 'opening' : 'closing';
      prevUnlocked = currentUnlocked;
    }
  });

  function handlePlatformAnimationEnd(e: AnimationEvent) {
    if (e.target !== e.currentTarget) return;
    if ((animState === 'opening' && unlocked) || (animState === 'closing' && !unlocked)) {
      animState = 'idle';
      updateHandles();
    }
  }

  function updateHandles() {
    if (!nodeEl || !chassisEl) return;
    const w = nodeEl.offsetWidth;
    const posX = node.position?.x ?? 0;
    const posY = node.position?.y ?? 0;

    if (isMobile) {
      const nodeRect = nodeEl.getBoundingClientRect();
      const platformRect = platformEl?.getBoundingClientRect();
      const bottomY = platformRect
        ? platformRect.bottom - nodeRect.top
        : chassisEl.offsetHeight;
      onUpdateHandles?.(node.id, {
        source: { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY },
        target: { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY + bottomY + JACK_LENGTH }
      });
    } else {
      const chassisCenterY = posY + chassisEl.offsetHeight / 2;
      onUpdateHandles?.(node.id, {
        source: { x: posX + w, y: chassisCenterY },
        target: { x: posX - JACK_LENGTH, y: chassisCenterY }
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

  $effect(() => {
    unlocked;
    animState;
    isMobile;

    untrack(() => updateHandles());

    if (animState === 'idle') return;
    let rafId = 0;
    const tick = () => {
      updateHandles();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  });
</script>

<div
  bind:this={nodeEl}
  class="relative select-none flex flex-col pointer-events-none"
  style:width="{isMobile ? MOBILE_CARD_MIN_WIDTH : DESKTOP_CARD_MIN_WIDTH}px"
>
  <div
    bind:this={chassisEl}
    class="pointer-events-auto relative z-30 rounded-3xl border-2 border-border bg-surface text-text-primary shadow-md flex items-center"
    class:px-12={!isMobile}
    class:py-7={!isMobile}
    class:px-8={isMobile}
    class:py-6={isMobile}
    class:ring-4={selected}
    class:ring-primary={selected}
  >
    {#if isMobile}
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

    {#if unlocked}
      <a
        href={node.data.href}
        class="font-bold hover:underline tracking-tight"
        class:text-xl={isMobile}
        class:pl-8={isMobile}
        class:text-2xl={!isMobile}
      >
        {node.data.title}
      </a>
    {:else}
      <span
        aria-disabled="true"
        class="font-bold tracking-tight text-text-secondary cursor-not-allowed opacity-60"
        class:text-xl={isMobile}
        class:pl-8={isMobile}
        class:text-2xl={!isMobile}
      >
        {node.data.title}
      </span>
    {/if}
  </div>

  <div
    class="relative z-10 -mt-3 pt-3 pointer-events-none"
    style="clip-path: inset(0 -80px -100px -80px);"
  >
    <div
      class="stage-1 absolute top-3 left-3 right-3 h-12 z-10 rounded-b-xl border-x-2 border-b-2 border-slate-300 dark:border-slate-600 bg-base-300 dark:bg-slate-800"
      class:stage-open={animState === 'idle' && unlocked}
      class:stage-closed={animState === 'idle' && !unlocked}
      class:stage-opening={animState === 'opening'}
      class:stage-closing={animState === 'closing'}
      aria-hidden="true"
    ></div>

    <div
      bind:this={platformEl}
      class="stage-2 pointer-events-auto relative z-20 mx-5 rounded-b-xl border-x-2 border-b-2 border-slate-300 dark:border-slate-600 bg-base-200 dark:bg-slate-900 shadow-sm"
      class:stage-open={animState === 'idle' && unlocked}
      class:stage-closed={animState === 'idle' && !unlocked}
      class:stage-opening={animState === 'opening'}
      class:stage-closing={animState === 'closing'}
      onanimationend={handlePlatformAnimationEnd}
    >
      <div class="px-3.5 py-2.5 min-h-[3.75rem] flex items-center">
        <p class="m-0 text-sm text-text-secondary leading-snug" aria-hidden={!unlocked}>
          {node.data.description ?? 'TODO'}
        </p>
      </div>

      <div
        class="h-3 bg-base-300 dark:bg-slate-700 border-t-2 border-slate-300 dark:border-slate-600 rounded-b-[10px] flex items-center justify-between px-3"
        aria-hidden="true"
      >
        <div class="w-2.5 h-1 bg-slate-400 dark:bg-slate-500"></div>
        <div class="w-2.5 h-1 bg-slate-400 dark:bg-slate-500"></div>
      </div>

      {#if isMobile}
        <!-- Input connector on bottom left of telescoping platform (pointing downwards) -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute pointer-events-auto cursor-default z-10"
          style="left: {MOBILE_HANDLE_OFFSET_X - 22}px; bottom: -2px; transform: translate(-100%, 50%) rotate(-90deg); transform-origin: 100% 50%;"
          onpointerdown={(e) => e.stopPropagation()}
        >
          <TsJack showHalo={highlightInput} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .stage-1,
  .stage-2 {
    will-change: transform;
  }

  .stage-1.stage-closed {
    transform: translateY(calc(-100% + 7px));
  }

  .stage-1.stage-open {
    transform: translateY(0);
  }

  .stage-2.stage-closed {
    transform: translateY(calc(-100% + 13px));
  }

  .stage-2.stage-open {
    transform: translateY(0);
  }

  .stage-1.stage-opening {
    animation: stage1-open 580ms forwards;
  }

  .stage-2.stage-opening {
    animation: stage2-open 580ms forwards;
  }

  .stage-1.stage-closing {
    animation: stage1-close 420ms forwards;
  }

  .stage-2.stage-closing {
    animation: stage2-close 420ms forwards;
  }

  @keyframes stage1-open {
    0% {
      transform: translateY(calc(-100% + 7px));
      animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
    }
    14% {
      transform: translateY(calc(-100% + 16px));
      animation-timing-function: linear;
    }
    26% {
      transform: translateY(calc(-100% + 16px));
      animation-timing-function: linear;
    }
    70% {
      transform: translateY(0);
      animation-timing-function: ease-out;
    }
    76% {
      transform: translateY(-1.5px);
      animation-timing-function: ease-in;
    }
    82%,
    100% {
      transform: translateY(0);
    }
  }

  @keyframes stage2-open {
    0% {
      transform: translateY(calc(-100% + 13px));
      animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
    }
    14% {
      transform: translateY(calc(-100% + 22px));
      animation-timing-function: linear;
    }
    26% {
      transform: translateY(calc(-100% + 22px));
      animation-timing-function: linear;
    }
    90% {
      transform: translateY(0);
      animation-timing-function: ease-out;
    }
    95% {
      transform: translateY(2px);
      animation-timing-function: ease-in;
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes stage1-close {
    0%,
    15% {
      transform: translateY(0);
      animation-timing-function: linear;
    }
    76% {
      transform: translateY(calc(-100% + 15px));
      animation-timing-function: linear;
    }
    86% {
      transform: translateY(calc(-100% + 15px));
      animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    }
    100% {
      transform: translateY(calc(-100% + 7px));
    }
  }

  @keyframes stage2-close {
    0% {
      transform: translateY(0);
      animation-timing-function: linear;
    }
    76% {
      transform: translateY(calc(-100% + 21px));
      animation-timing-function: linear;
    }
    86% {
      transform: translateY(calc(-100% + 21px));
      animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    }
    100% {
      transform: translateY(calc(-100% + 13px));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stage-1.stage-opening,
    .stage-2.stage-opening,
    .stage-1.stage-closing,
    .stage-2.stage-closing {
      animation-duration: 0.01ms;
    }
  }
</style>
