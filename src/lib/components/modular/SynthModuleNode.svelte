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
  class="rounded-3xl border-2 border-border bg-surface text-text-primary px-12 py-7 shadow-md select-none relative flex items-center justify-between gap-8 min-w-[325px]"
  class:ring-4={selected}
  class:ring-primary={selected}
>
  <Handle
    type="target"
    position={Position.Left}
    class="!w-14 !h-14 !bg-transparent !border-0 cursor-pointer flex items-center justify-center !pointer-events-auto"
    isConnectableStart={false}
  >
    <TsJack size={55} />
  </Handle>

  <a href={data.href} class="nodrag text-2xl font-bold hover:underline tracking-tight">
    {data.title}
  </a>

  <Handle
    type="source"
    position={Position.Right}
    class="!w-8 !h-10 !bg-transparent !border-0 !pointer-events-auto cursor-pointer flex items-center overflow-visible"
  >
    {#if hasPlugPokingOut}
      <div class="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter]">
        <TsPlug color="var(--color-primary)" scale={2.5} />
      </div>
    {:else}
      <div class="w-6 h-6 rounded-full bg-surface border-4 border-primary/60 shadow-inner"></div>
    {/if}
  </Handle>
</div>
