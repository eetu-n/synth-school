<script lang="ts">
  import { Handle, Position, useStore, type NodeProps, type Node } from '@xyflow/svelte';
  import type { ModuleNodeData } from '$lib/modular/types';
  import TsJack from './TsJack.svelte';
  import TsPlug from './TsPlug.svelte';

  let { id, data, selected }: NodeProps<Node<ModuleNodeData>> = $props();

  const store = useStore();

  const isConnectedAsSource = $derived(
    store.edges.some((e) => e.source === id)
  );

  const isDraggingFromThis = $derived(
    store.connection.inProgress &&
      store.connection.fromHandle?.nodeId === id &&
      store.connection.fromHandle?.type === 'source'
  );

  const hasPlugPokingOut = $derived(!isConnectedAsSource && !isDraggingFromThis);
</script>

<div
  class="rounded-xl border border-border bg-surface text-text-primary px-5 py-3 shadow-sm select-none relative flex items-center justify-between gap-3 min-w-[130px]"
  class:ring-2={selected}
  class:ring-primary={selected}
>
  <Handle
    type="target"
    position={Position.Left}
    class="!w-6 !h-6 !bg-transparent !border-0 cursor-pointer flex items-center justify-center !pointer-events-auto"
    isConnectableStart={false}
  >
    <TsJack size={22} />
  </Handle>

  <a href={data.href} class="nodrag text-sm font-semibold hover:underline">
    {data.title}
  </a>

  <Handle
    type="source"
    position={Position.Right}
    class="!w-3 !h-4 !bg-transparent !border-0 !pointer-events-auto cursor-pointer flex items-center overflow-visible"
  >
    {#if hasPlugPokingOut}
      <div class="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter]">
        <TsPlug color="var(--color-primary)" />
      </div>
    {:else}
      <div class="w-2.5 h-2.5 rounded-full bg-surface border-2 border-primary/60 shadow-inner"></div>
    {/if}
  </Handle>
</div>
