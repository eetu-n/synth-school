<script lang="ts">
  import { Handle, Position, type NodeProps } from '@xyflow/svelte';
  import type { ModuleNodeData } from '$lib/modular/types';

  let { data, selected }: NodeProps = $props();
  const moduleData = $derived(data as unknown as ModuleNodeData);
</script>

<div
  class="rounded-xl border border-border bg-surface text-text-primary px-5 py-3 shadow-sm select-none relative flex items-center justify-between gap-3 min-w-[130px]"
  class:ring-2={selected}
  class:ring-primary={selected}
>
  <Handle
    type="target"
    position={Position.Left}
    class="!w-3 !h-3 !rounded-full !bg-primary !border-2 !border-surface cursor-pointer"
  />

  <a href={moduleData.href} class="text-sm font-semibold hover:underline">
    {moduleData.title}
  </a>

  <Handle
    type="source"
    position={Position.Right}
    class="!w-3 !h-3 !rounded-full !bg-secondary !border-2 !border-surface cursor-pointer"
  />
</div>
