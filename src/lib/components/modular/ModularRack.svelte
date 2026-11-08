<script lang="ts">
  import {
    SvelteFlow,
    Background,
    BackgroundVariant,
    PanOnScrollMode,
    type NodeTypes,
    type EdgeTypes,
    type Connection,
    type IsValidConnection,
    type Edge,
    type Node,
    type CoordinateExtent,
    type OnReconnect,
    type OnReconnectEnd
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCableEdge from './PatchCableEdge.svelte';
  import PatchConnectionLine from './PatchConnectionLine.svelte';
  import RackScrollMapper from './RackScrollMapper.svelte';
  import type { ModuleNode, CableEdge, ModuleNodeData } from '$lib/modular/types';

  const nodeTypes: NodeTypes = {
    default: SynthModuleNode
  };

  const edgeTypes: EdgeTypes = {
    default: PatchCableEdge
  };

  const zoom = 1;

  let {
    nodes = [],
    edges: initialEdges = [],
    isValidConnection: customIsValidConnection
  }: {
    nodes: ModuleNode[];
    edges?: CableEdge[];
    isValidConnection?: IsValidConnection;
  } = $props();

  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // svelte-ignore state_referenced_locally
  let edges = $state.raw<CableEdge[]>(initialEdges);

  $effect(() => {
    edges = initialEdges;
  });

  const layoutedNodes = $derived.by<Node<ModuleNodeData>[]>(() => {
    const nodesByPhase = new Map<number, ModuleNode[]>();
    for (const node of nodes) {
      const p = node.phase ?? node.data?.phase ?? 1;
      const list = nodesByPhase.get(p) ?? [];
      list.push(node);
      nodesByPhase.set(p, list);
    }

    const sortedPhases = Array.from(nodesByPhase.keys()).sort((a, b) => a - b);
    const height = containerHeight > 0 ? containerHeight : 500;
    const centerY = height / 2 - 55;

    return nodes.map((node) => {
      if (node.position) {
        return node as Node<ModuleNodeData>;
      }
      const p = node.phase ?? node.data?.phase ?? 1;
      const phaseIndex = sortedPhases.indexOf(p);
      const siblings = nodesByPhase.get(p) ?? [node];
      const nodeIndex = siblings.indexOf(node);
      const count = siblings.length;

      const x = 125 + phaseIndex * 700;
      const y = centerY + (nodeIndex - (count - 1) / 2) * 275;

      return {
        ...node,
        position: { x, y }
      } as Node<ModuleNodeData>;
    });
  });

  const rackWidth = $derived.by(() => {
    let maxX = 0;
    for (const node of layoutedNodes) {
      if (node.position.x > maxX) {
        maxX = node.position.x;
      }
    }
    return Math.max(containerWidth, maxX + 650);
  });

  const translateExtent = $derived<CoordinateExtent>([
    [0, -Infinity],
    [rackWidth, Infinity]
  ]);

  function validateConnection(connection: Edge | Connection): boolean {
    if (customIsValidConnection) {
      return customIsValidConnection(connection);
    }
    if (!connection.source || !connection.target) return false;
    if (connection.source === connection.target) return false;

    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return false;

    if (sourceNode.data?.allowedTargets !== undefined) {
      return sourceNode.data.allowedTargets.includes(connection.target);
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

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target) return;
    if (!validateConnection(connection)) return;

    const newEdge: CableEdge = {
      id: `cable-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle
    };
    edges = [...edges.filter((e) => e.source !== connection.source), newEdge];
  }

  const handleReconnect: OnReconnect<CableEdge> = (oldEdge, newConnection) => {
    if (!validateConnection(newConnection)) return;
    edges = edges.map((e) =>
      e.id === oldEdge.id
        ? {
            ...e,
            source: newConnection.source,
            sourceHandle: newConnection.sourceHandle,
            target: newConnection.target,
            targetHandle: newConnection.targetHandle
          }
        : e
    );
  };

  const handleReconnectEnd: OnReconnectEnd<CableEdge> = (
    _event,
    edge,
    _handleType,
    connectionState
  ) => {
    if (!connectionState.isValid) {
      edges = edges.filter((e) => e.id !== edge.id);
    }
  };
</script>

<div
  class="modular-rack w-full h-full min-h-[500px] flex-grow select-none"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <SvelteFlow
    nodes={layoutedNodes}
    bind:edges
    {nodeTypes}
    {edgeTypes}
    {translateExtent}
    connectionRadius={40}
    isValidConnection={validateConnection}
    elevateNodesOnSelect={false}
    connectionLineComponent={PatchConnectionLine}
    panOnScroll={true}
    panOnScrollMode={PanOnScrollMode.Horizontal}
    panOnDrag={true}
    preventScrolling={false}
    zoomOnScroll={false}
    zoomOnPinch={false}
    zoomOnDoubleClick={false}
    minZoom={zoom}
    maxZoom={zoom}
    proOptions={{ hideAttribution: true }}
    onconnect={handleConnect}
    onreconnect={handleReconnect}
    onreconnectend={handleReconnectEnd}
  >
    <RackScrollMapper {rackWidth} {containerWidth} />
    <Background variant={BackgroundVariant.Dots} gap={60} size={3} patternColor="var(--color-grid)" />
  </SvelteFlow>
</div>

<style>
  :global(.modular-rack .svelte-flow__edges) {
    z-index: 10;
  }
  :global(.modular-rack .svelte-flow__edge-labels) {
    z-index: 15;
  }
</style>
