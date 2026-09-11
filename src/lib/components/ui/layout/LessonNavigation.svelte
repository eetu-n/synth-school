<script lang="ts">
  import leftIcon from '$lib/assets/angles-left.svg?raw';
  import rightIcon from '$lib/assets/angles-right.svg?raw';

  interface Props {
    prev?: string | null;
    next?: string | null;
    nextClass?: string;
  }

  let { prev, next, nextClass }: Props = $props();
</script>

<div class="flex justify-between items-center py-4">
  {#if prev}
    <a href={prev} class="p-2 text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors" aria-label="Previous Lesson">
      <span class="w-6 h-6 block">{@html leftIcon}</span>
    </a>
  {:else}
    <div class="p-2 text-text-secondary opacity-30 cursor-not-allowed" aria-hidden="true">
      <span class="w-6 h-6 block">{@html leftIcon}</span>
    </div>
  {/if}

  {#if next}
    <a href={next} class="p-2 text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors {nextClass}" aria-label="Next Lesson">
      <span class="w-6 h-6 block">{@html rightIcon}</span>
    </a>
  {:else}
    <div class="p-2 text-text-secondary opacity-30 cursor-not-allowed" aria-hidden="true">
      <span class="w-6 h-6 block">{@html rightIcon}</span>
    </div>
  {/if}
</div>
