<script lang="ts" generics="T">
  type RadioOption<T> = {
    label: string;
    value: T;
  };

  let {
    options,
    value = $bindable(),
    label = undefined
  }: {
    options: RadioOption<T>[];
    value: T;
    label?: string;
  } = $props();
</script>

<div class="flex flex-col gap-2 items-center w-32">
  {#if label}
    <span class="text-[10px] uppercase font-bold text-base-content/70">{label}</span>
  {/if}
  <div class="flex flex-col gap-1 w-full">
    {#each options as option}
      <button 
        class="btn btn-xs h-8 w-full flex items-center justify-start px-2 gap-2 transition-all {value === option.value ? 'btn-primary shadow-md' : 'btn-ghost bg-base-100/30 border-base-content/10 border'}"
        onclick={() => value = option.value}
      >
        <div class="w-2 h-2 rounded-full {value === option.value ? 'bg-white shadow-[0_0_8px_white]' : 'bg-base-content/10'}"></div>
        <span class="text-[10px] font-bold {value === option.value ? 'text-primary-content' : 'text-base-content/60'}">{option.label}</span>
      </button>
    {/each}
  </div>
</div>
