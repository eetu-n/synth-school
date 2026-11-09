<script lang="ts">
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCableEdge from './PatchCableEdge.svelte';
  import PatchConnectionLine from './PatchConnectionLine.svelte';
  import type {
    ModuleNode,
    CableEdge,
    Connection,
    HandlePositions,
    XYPosition
  } from '$lib/modular/types';

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

  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let panStart = $state({ x: 0, y: 0, panX: 0, panY: 0 });

  let handlePositions = $state<Record<string, HandlePositions>>({});

  interface DragState {
    type: 'new' | 'reconnect';
    sourceId: string;
    from: XYPosition;
    to: XYPosition;
    hoveredTargetId: string | null;
    edgeId?: string;
  }

  let activeDrag = $state<DragState | null>(null);

  const isMobile = $derived(
    containerWidth > 0
      ? containerWidth < 768
      : (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  );

  const layoutedNodes = $derived.by<ModuleNode[]>(() => {
    const nodesByPhase = new Map<number, ModuleNode[]>();
    for (const node of nodes) {
      const p = node.phase ?? node.data?.phase ?? 1;
      const list = nodesByPhase.get(p) ?? [];
      list.push(node);
      nodesByPhase.set(p, list);
    }

    const sortedPhases = Array.from(nodesByPhase.keys()).sort((a, b) => a - b);
    const numPhases = sortedPhases.length;
    const height = containerHeight > 0 ? containerHeight : 500;
    const centerY = height / 2 - 55;

    return nodes.map((node) => {
      if (node.position) {
        return {
          ...node,
          data: {
            ...node.data,
            isMobile
          }
        };
      }
      const p = node.phase ?? node.data?.phase ?? 1;
      const phaseIndex = sortedPhases.indexOf(p);
      const siblings = nodesByPhase.get(p) ?? [node];
      const nodeIndex = siblings.indexOf(node);
      const count = siblings.length;

      let x: number;
      let y: number;

      if (isMobile) {
        // Bottom-up layout: Phase 1 at the bottom, higher phases stacked above
        const invertedPhaseIndex = (numPhases - 1) - phaseIndex;
        const baseX = Math.max(55, (containerWidth - 280) / 2);
        x = baseX + (nodeIndex - (count - 1) / 2) * 280;
        y = 70 + invertedPhaseIndex * 240;
      } else {
        // Desktop left-to-right layout
        x = 125 + phaseIndex * 700;
        y = centerY + (nodeIndex - (count - 1) / 2) * 275;
      }

      return {
        ...node,
        position: { x, y },
        data: {
          ...node.data,
          isMobile
        }
      };
    });
  });

  const rackWidth = $derived.by(() => {
    if (isMobile) {
      return containerWidth;
    }
    let maxX = 0;
    for (const node of layoutedNodes) {
      if (node.position && node.position.x > maxX) {
        maxX = node.position.x;
      }
    }
    return Math.max(containerWidth, maxX + 650);
  });

  const rackHeight = $derived.by(() => {
    if (isMobile) {
      let maxY = 0;
      for (const node of layoutedNodes) {
        if (node.position && node.position.y > maxY) {
          maxY = node.position.y;
        }
      }
      return Math.max(containerHeight, maxY + 240);
    }
    return Math.max(containerHeight, 500);
  });

  // Clamp pan offsets when dimensions change
  $effect(() => {
    if (!isMobile) {
      const maxScrollX = Math.max(0, rackWidth - containerWidth);
      panX = Math.min(0, Math.max(-maxScrollX, panX));
      panY = 0;
    } else {
      const maxScrollY = Math.max(0, rackHeight - containerHeight);
      panY = Math.min(0, Math.max(-maxScrollY, panY));
      panX = 0;
    }
  });

  // Set initial vertical scroll position on mobile to show Phase 1 (bottom)
  let initialMobileSet = $state(false);
  $effect(() => {
    if (isMobile && containerHeight > 0 && !initialMobileSet) {
      let maxY = 0;
      for (const node of layoutedNodes) {
        if (node.position && node.position.y > maxY) {
          maxY = node.position.y;
        }
      }
      panY = Math.min(0, -(maxY - containerHeight + 150));
      initialMobileSet = true;
    }
  });

  function getSourceHandle(nodeId: string): XYPosition {
    if (handlePositions[nodeId]?.source) {
      return handlePositions[nodeId].source;
    }
    const node = layoutedNodes.find((n) => n.id === nodeId);
    const posX = node?.position?.x ?? 0;
    const posY = node?.position?.y ?? 0;
    if (isMobile) {
      return { x: posX + 48, y: posY };
    }
    return { x: posX + 325, y: posY + 55 };
  }

  function getTargetHandle(nodeId: string): XYPosition {
    if (handlePositions[nodeId]?.target) {
      return handlePositions[nodeId].target;
    }
    const node = layoutedNodes.find((n) => n.id === nodeId);
    const posX = node?.position?.x ?? 0;
    const posY = node?.position?.y ?? 0;
    if (isMobile) {
      return { x: posX + 48, y: posY + 110 };
    }
    return { x: posX, y: posY + 55 };
  }

  function handleUpdateHandles(id: string, handles: HandlePositions) {
    handlePositions[id] = handles;
  }

  function validateConnection(sourceId: string, targetId: string): boolean {
    if (customIsValidConnection) {
      return customIsValidConnection({ source: sourceId, target: targetId });
    }
    if (!sourceId || !targetId) return false;
    if (sourceId === targetId) return false;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return false;

    if (sourceNode.data?.allowedTargets !== undefined) {
      return sourceNode.data.allowedTargets.includes(targetId);
    }

    const sourcePhase = sourceNode.phase ?? sourceNode.data?.phase ?? 1;
    const targetPhase = targetNode.phase ?? targetNode.data?.phase ?? 1;

    const sortedPhases = Array.from(
      new Set(nodes.map((n) => n.phase ?? n.data?.phase ?? 1))
    ).sort((a, b) => a - b);
    const sourceIndex = sortedPhases.indexOf(sourcePhase);
    const targetIndex = sortedPhases.indexOf(targetPhase);

    return (
      targetPhase === sourcePhase + 1 ||
      (sourceIndex !== -1 && targetIndex === sourceIndex + 1)
    );
  }

  function handleStartDrag(sourceId: string, event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();

    const from = getSourceHandle(sourceId);
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const to = {
      x: event.clientX - rect.left - panX,
      y: event.clientY - rect.top - panY
    };

    activeDrag = {
      type: 'new',
      sourceId,
      from,
      to,
      hoveredTargetId: null
    };
  }

  function handleStartReconnect(edgeId: string, event: PointerEvent) {
    event.stopPropagation();
    event.preventDefault();

    const edge = edges.find((e) => e.id === edgeId);
    if (!edge || !containerEl) return;

    const from = getSourceHandle(edge.source);
    const rect = containerEl.getBoundingClientRect();
    const to = {
      x: event.clientX - rect.left - panX,
      y: event.clientY - rect.top - panY
    };

    activeDrag = {
      type: 'reconnect',
      edgeId,
      sourceId: edge.source,
      from,
      to,
      hoveredTargetId: edge.target
    };
  }

  function handleWindowPointerMove(event: PointerEvent) {
    if (!containerEl) return;

    if (activeDrag) {
      const rect = containerEl.getBoundingClientRect();
      const worldX = event.clientX - rect.left - panX;
      const worldY = event.clientY - rect.top - panY;

      const connectionRadius = 45;
      let matchedTargetId: string | null = null;
      let targetPos: XYPosition | null = null;

      for (const node of layoutedNodes) {
        if (node.id === activeDrag.sourceId) continue;
        const candidatePos = getTargetHandle(node.id);
        const dist = Math.hypot(worldX - candidatePos.x, worldY - candidatePos.y);

        if (dist <= connectionRadius && validateConnection(activeDrag.sourceId, node.id)) {
          matchedTargetId = node.id;
          targetPos = candidatePos;
          break;
        }
      }

      if (matchedTargetId && targetPos) {
        activeDrag.to = { x: targetPos.x, y: targetPos.y };
        activeDrag.hoveredTargetId = matchedTargetId;
      } else {
        activeDrag.to = { x: worldX, y: worldY };
        activeDrag.hoveredTargetId = null;
      }
    } else if (isPanning) {
      if (!isMobile) {
        const dx = event.clientX - panStart.x;
        const maxScrollX = Math.max(0, rackWidth - containerWidth);
        panX = Math.min(0, Math.max(-maxScrollX, panStart.panX + dx));
      } else {
        const dy = event.clientY - panStart.y;
        const maxScrollY = Math.max(0, rackHeight - containerHeight);
        panY = Math.min(0, Math.max(-maxScrollY, panStart.panY + dy));
      }
    }
  }

  function handleWindowPointerUp() {
    if (activeDrag) {
      if (activeDrag.hoveredTargetId) {
        if (activeDrag.type === 'new') {
          const newEdge: CableEdge = {
            id: `cable-${activeDrag.sourceId}-${activeDrag.hoveredTargetId}-${Date.now()}`,
            source: activeDrag.sourceId,
            target: activeDrag.hoveredTargetId
          };
          edges = [...edges.filter((e) => e.source !== activeDrag.sourceId), newEdge];
        } else if (activeDrag.type === 'reconnect' && activeDrag.edgeId) {
          edges = edges.map((e) =>
            e.id === activeDrag!.edgeId ? { ...e, target: activeDrag!.hoveredTargetId! } : e
          );
        }
      } else if (activeDrag.type === 'reconnect' && activeDrag.edgeId) {
        // Disconnected / unplugged in empty space
        edges = edges.filter((e) => e.id !== activeDrag!.edgeId);
      }
      activeDrag = null;
    }

    if (isPanning) {
      isPanning = false;
    }
  }

  function handleContainerPointerDown(event: PointerEvent) {
    if (activeDrag) return;
    // Only drag pan if clicking background/canvas directly
    const target = event.target as HTMLElement | SVGElement | null;
    if (
      target &&
      (target.classList.contains('modular-rack') ||
        target.tagName === 'svg' ||
        target.tagName === 'rect')
    ) {
      isPanning = true;
      panStart = {
        x: event.clientX,
        y: event.clientY,
        panX,
        panY
      };
    }
  }

  function handleWheel(event: WheelEvent) {
    if (!isMobile) {
      const delta =
        event.deltaMode === 1
          ? event.deltaY * 20
          : Math.abs(event.deltaY) > Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;

      const maxScrollX = Math.max(0, rackWidth - containerWidth);
      panX = Math.min(0, Math.max(-maxScrollX, panX - delta));
      event.preventDefault();
    } else {
      const delta = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
      const maxScrollY = Math.max(0, rackHeight - containerHeight);
      panY = Math.min(0, Math.max(-maxScrollY, panY - delta));
    }
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
  class:cursor-grab={!activeDrag && !isPanning}
  class:cursor-grabbing={isPanning}
  onwheel={handleWheel}
  onpointerdown={handleContainerPointerDown}
  role="region"
  aria-label="Modular Synthesizer Learning Rack"
>
  <div
    class="world absolute left-0 top-0 will-change-transform"
    style="width: {rackWidth}px; height: {rackHeight}px; transform: translate3d({panX}px, {panY}px, 0);"
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
                (e) => e.source === node.id && e.id !== activeDrag?.edgeId
              )}
              isDraggingFromThis={activeDrag?.sourceId === node.id}
              selected={activeDrag?.hoveredTargetId === node.id}
              onUpdateHandles={handleUpdateHandles}
              onStartDrag={handleStartDrag}
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
        {@const sourcePos = getSourceHandle(edge.source)}
        {@const targetPos = getTargetHandle(edge.target)}
        {#if sourcePos && targetPos}
          <PatchCableEdge
            id={edge.id}
            sourceX={sourcePos.x}
            sourceY={sourcePos.y}
            targetX={targetPos.x}
            targetY={targetPos.y}
            data={edge.data}
            reconnecting={activeDrag?.edgeId === edge.id}
            onStartReconnect={handleStartReconnect}
          />
        {/if}
      {/each}

      <!-- Render live dragging cable connection preview -->
      {#if activeDrag}
        <PatchConnectionLine
          from={activeDrag.from}
          to={activeDrag.to}
        />
      {/if}
    </svg>
  </div>
</div>
