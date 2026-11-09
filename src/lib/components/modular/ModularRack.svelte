<script lang="ts">
  import { onDestroy } from 'svelte';
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCableEdge from './PatchCableEdge.svelte';
  import PatchConnectionLine from './PatchConnectionLine.svelte';
  import type { ModuleNode, CableEdge, Connection } from '$lib/modular/types';
  import { computeRackLayout } from '$lib/modular/rackLayout';
  import { ModularRackState } from '$lib/modular/rackState.svelte';

  let {
    nodes = [],
    edges = $bindable([]),
    isValidConnection: customIsValidConnection
  }: {
    nodes: ModuleNode[];
    edges?: CableEdge[];
    isValidConnection?: (connection: Connection) => boolean;
  } = $props();

  let containerEl = $state<HTMLElement | null>(null);
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  const rackState = new ModularRackState();
  onDestroy(() => rackState.destroy());

  const isMobile = $derived(
    containerWidth > 0
      ? containerWidth < 768
      : (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  );

  const layout = $derived(computeRackLayout(nodes, containerWidth, containerHeight, isMobile));
  const layoutedNodes = $derived(layout.layoutedNodes);
  const rackWidth = $derived(layout.rackWidth);
  const rackHeight = $derived(layout.rackHeight);

  $effect(() => {
    rackState.clampPan(isMobile, rackWidth, rackHeight, containerWidth, containerHeight);
  });

  $effect(() => {
    rackState.initMobileScroll(isMobile, containerHeight, layoutedNodes);
  });

  function handleWindowPointerMove(event: PointerEvent) {
    rackState.handlePointerMove(
      event,
      containerEl,
      layoutedNodes,
      isMobile,
      rackWidth,
      rackHeight,
      containerWidth,
      containerHeight,
      nodes,
      customIsValidConnection
    );
  }

  function handleWindowPointerUp() {
    rackState.handlePointerUp(edges, (nextEdges) => {
      edges = nextEdges;
    });
  }

  function handleWheel(event: WheelEvent) {
    rackState.handleWheel(
      event,
      isMobile,
      rackWidth,
      rackHeight,
      containerWidth,
      containerHeight
    );
  }
</script>

<svelte:window
  onpointermove={handleWindowPointerMove}
  onpointerup={handleWindowPointerUp}
  onpointercancel={handleWindowPointerUp}
/>

<div
  bind:this={containerEl}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  class="modular-rack relative w-full h-full min-h-[500px] flex-grow select-none overflow-hidden touch-none"
  class:cursor-grab={!rackState.activeDrag && !rackState.isPanning}
  class:cursor-grabbing={rackState.isPanning}
  onwheel={handleWheel}
  onpointerdown={(e) => rackState.handleContainerPointerDown(e)}
  role="region"
  aria-label="Modular Synthesizer Learning Rack"
>
  <div
    class="world absolute left-0 top-0 will-change-transform"
    style="width: {rackWidth}px; height: {rackHeight}px; transform: translate3d({rackState.panX}px, {rackState.panY}px, 0);"
  >
    <!-- Background dot grid layer (z-0) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-0"
      style="width: {rackWidth}px; height: {rackHeight}px;"
    >
      <defs>
        <pattern id="rack-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="var(--color-grid)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rack-dots)" class="pointer-events-auto" />
    </svg>

    <!-- HTML Nodes Layer (z-10) -->
    <div class="absolute inset-0 pointer-events-none z-10">
      {#each layoutedNodes as node (node.id)}
        {#if node.position}
          <div
            class="absolute pointer-events-auto"
            style="left: {node.position.x}px; top: {node.position.y}px;"
          >
            <SynthModuleNode
              {node}
              isConnectedAsSource={edges.some(
                (e) => e.source === node.id && e.id !== rackState.activeDrag?.edgeId
              )}
              isDraggingFromThis={rackState.activeDrag?.sourceId === node.id}
              selected={rackState.activeDrag?.hoveredTargetId === node.id}
              onUpdateHandles={(id, h) => rackState.updateHandles(id, h)}
              onStartDrag={(id, e) =>
                rackState.startDrag(id, e, containerEl, layoutedNodes, isMobile)}
            />
          </div>
        {/if}
      {/each}
    </div>

    <!-- Cables & Plugs SVG Layer (z-20, in front of nodes and jacks) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
      style="width: {rackWidth}px; height: {rackHeight}px;"
    >
      <!-- Render connected patch cables -->
      {#each edges as edge (edge.id)}
        {@const sourcePos = rackState.getSourceHandle(edge.source, layoutedNodes, isMobile)}
        {@const targetPos = rackState.getTargetHandle(edge.target, layoutedNodes, isMobile)}
        {#if sourcePos && targetPos}
          <PatchCableEdge
            id={edge.id}
            sourceX={sourcePos.x}
            sourceY={sourcePos.y}
            targetX={targetPos.x}
            targetY={targetPos.y}
            data={edge.data}
            reconnecting={rackState.activeDrag?.edgeId === edge.id}
            onStartReconnect={(id, e) =>
              rackState.startReconnect(id, edges, e, containerEl, layoutedNodes, isMobile)}
          />
        {/if}
      {/each}

      <!-- Render live dragging cable connection preview -->
      {#if rackState.activeDrag}
        <PatchConnectionLine
          from={rackState.activeDrag.from}
          to={rackState.activeDrag.to}
          targetPos={rackState.activeDrag.targetPos}
          scrub={rackState.activeDrag.scrub ?? 0}
        />
      {/if}
    </svg>
  </div>
</div>
