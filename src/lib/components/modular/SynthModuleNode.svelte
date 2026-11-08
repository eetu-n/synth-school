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
    class="!min-w-0 !w-0 !min-h-0 !h-0 !bg-transparent !border-0 !rounded-none !shadow-none !outline-none flex items-center justify-center overflow-visible"
    isConnectableStart={false}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-default"
      onmousedown={(e) => e.stopPropagation()}
      ontouchstart={(e) => e.stopPropagation()}
      onpointerdown={(e) => e.stopPropagation()}
    >
      <TsJack size={55} />
    </div>
  </Handle>

  <a href={data.href} class="nodrag text-2xl font-bold hover:underline tracking-tight">
    {data.title}
  </a>

  <Handle
    type="source"
    position={Position.Right}
    class="!min-w-0 !w-0 !min-h-0 !h-0 !bg-transparent !border-0 !rounded-none !shadow-none !outline-none !pointer-events-auto cursor-pointer flex items-center justify-center overflow-visible"
  >
    {#if hasPlugPokingOut}
      <div class="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto cursor-grab hover:brightness-110 active:cursor-grabbing transition-[filter]">
        <TsPlug color="var(--color-primary)" scale={2.5} />
      </div>
    {/if}
  </Handle>
</div>
