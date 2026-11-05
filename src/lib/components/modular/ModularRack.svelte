<script lang="ts">
  import {
    SvelteFlow,
    Background,
    BackgroundVariant,
    Controls,
    type NodeTypes,
    type EdgeTypes,
    type Connection,
    type IsValidConnection,
    type Edge
  } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import SynthModuleNode from './SynthModuleNode.svelte';
  import PatchCableEdge from './PatchCableEdge.svelte';
  import PatchConnectionLine from './PatchConnectionLine.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';

  const nodeTypes: NodeTypes = {
    default: SynthModuleNode
  };

  const edgeTypes: EdgeTypes = {
    default: PatchCableEdge
  };

  let {
    nodes = [],
    edges: initialEdges = [],
    isValidConnection: customIsValidConnection
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

  function validateConnection(connection: Edge | Connection): boolean {
    if (customIsValidConnection) {
      return customIsValidConnection(connection);
    }
    if (!connection.source || !connection.target) return false;
    const sourceNode = nodes.find((n) => n.id === connection.source);
    if (!sourceNode?.data?.allowedTargets) return false;
    return sourceNode.data.allowedTargets.includes(connection.target);
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
    edges = [...edges, newEdge];
  }
</script>

<div class="modular-rack w-full h-full min-h-[500px] flex-grow select-none">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    isValidConnection={validateConnection}
    elevateNodesOnSelect={false}
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
