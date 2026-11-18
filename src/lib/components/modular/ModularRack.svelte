<script lang="ts">
  import { onDestroy } from 'svelte';
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCable from './PatchCable.svelte';
  import type { ModuleNode, CableEdge, Connection } from '$lib/modular/types';
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

  const rackState = new ModularRackState({
    getNodes: () => nodes,
    getEdges: () => edges,
    getIsValidConnection: () => customIsValidConnection,
    onEdgesChange: (nextEdges) => {
      edges = nextEdges;
    }
  });
  onDestroy(() => rackState.destroy());

  $effect(() => {
    rackState.syncViewport();
  });

  function handleWindowPointerUp() {
    rackState.handlePointerUp();
  }
</script>

<svelte:window
  onpointermove={(e) => rackState.handlePointerMove(e)}
  onpointerup={handleWindowPointerUp}
  onpointercancel={handleWindowPointerUp}
/>

<div
  bind:this={rackState.containerEl}
  bind:clientWidth={rackState.containerWidth}
  bind:clientHeight={rackState.containerHeight}
  data-pan-target
  class="modular-rack relative w-full h-full min-h-[500px] flex-grow select-none overflow-hidden touch-none"
  class:cursor-grab={!rackState.activeDrag && !rackState.isPanning}
  class:cursor-grabbing={rackState.isPanning}
  onwheel={(e) => rackState.handleWheel(e)}
  onpointerdown={(e) => rackState.handleContainerPointerDown(e)}
  role="region"
  aria-label="Modular Synthesizer Learning Rack"
>
  <div
    class="world absolute left-0 top-0 will-change-transform"
    style="width: {rackState.rackWidth}px; height: {rackState.rackHeight}px; transform: translate3d({rackState.panX}px, {rackState.panY}px, 0);"
  >
    <!-- Background dot grid layer (z-0) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-0"
      style="width: {rackState.rackWidth}px; height: {rackState.rackHeight}px;"
    >
      <defs>
        <pattern id="rack-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="var(--color-grid)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rack-dots)" data-pan-target class="pointer-events-auto" />
    </svg>

    <!-- HTML Nodes Layer (z-10) -->
    <div class="absolute inset-0 pointer-events-none z-10">
      {#each rackState.layoutedNodes as node (node.id)}
        {#if node.position}
          <div
            class="absolute pointer-events-auto"
            style="left: {node.position.x}px; top: {node.position.y}px;"
          >
            <SynthModuleNode
              {node}
              isMobile={rackState.isMobile}
              unlocked={rackState.isNodeUnlocked(node.id)}
              isConnectedAsSource={edges.some(
                (e) => e.source === node.id && e.id !== rackState.activeDrag?.edgeId
              )}
              isDraggingFromThis={rackState.activeDrag?.sourceId === node.id}
              selected={rackState.activeDrag?.hoveredTargetId === node.id}
              onUpdateHandles={(id, h) => rackState.updateHandles(id, h)}
              onStartDrag={(id, e) => rackState.startDrag(id, e)}
            />
          </div>
        {/if}
      {/each}
    </div>

    <!-- Cables & Plugs SVG Layer (z-20, in front of nodes and jacks) -->
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
      style="width: {rackState.rackWidth}px; height: {rackState.rackHeight}px;"
    >
      {#each edges as edge (edge.id)}
        {@const isReconnecting = rackState.activeDrag?.edgeId === edge.id}
        {@const drag = isReconnecting ? rackState.activeDrag : null}
        <PatchCable
          id={edge.id}
          from={drag ? drag.from : rackState.getSourceHandle(edge.source)}
          to={drag ? drag.to : rackState.getTargetHandle(edge.target)}
          targetPos={drag?.targetPos ?? null}
          data={edge.data}
          isMobile={rackState.isMobile}
          dragging={isReconnecting}
          scrub={drag?.scrub ?? 1}
          onStartReconnect={(id, e) => rackState.startReconnect(id, e)}
        />
      {/each}

      {#if rackState.activeDrag?.type === 'new'}
        <PatchCable
          from={rackState.activeDrag.from}
          to={rackState.activeDrag.to}
          targetPos={rackState.activeDrag.targetPos}
          isMobile={rackState.isMobile}
          dragging={true}
          scrub={rackState.activeDrag.scrub ?? 0}
        />
      {/if}
    </svg>
  </div>
</div>
