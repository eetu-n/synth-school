<script lang="ts">
  import {
    SvelteFlow,
    Background,
    BackgroundVariant,
    Controls,
    type NodeTypes,
    type EdgeTypes,
    type Connection,
    type IsValidConnection
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCableEdge from './PatchCableEdge.svelte';
  import PatchConnectionLine from './PatchConnectionLine.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';

  const nodeTypes: NodeTypes = {
    default: SynthModuleNode as any
  };

  const edgeTypes: EdgeTypes = {
    default: PatchCableEdge as any
  };

  let {
    nodes = [],
    edges: initialEdges = [],
    isValidConnection
  }: {
    nodes: ModuleNode[];
    edges?: CableEdge[];
    isValidConnection?: IsValidConnection;
  } = $props();

  // svelte-ignore state_referenced_locally
  let edges = $state.raw<CableEdge[]>(initialEdges);

  $effect(() => {
    edges = initialEdges;
  });

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target) return;
    if (isValidConnection && !isValidConnection(connection)) return;

    const newEdge: CableEdge = {
      id: `cable-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle
    };
    edges = [...edges, newEdge];
  }
</script>

<div class="w-full h-full min-h-[500px] flex-grow select-none">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    {isValidConnection}
    connectionLineComponent={PatchConnectionLine}
    fitView
    fitViewOptions={{ padding: 0.3 }}
    proOptions={{ hideAttribution: true }}
    onconnect={handleConnect}
  >
    <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} patternColor="var(--color-grid)" />
    <Controls position="bottom-right" />
  </SvelteFlow>
</div>
