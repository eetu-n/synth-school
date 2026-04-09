<script lang="ts">
  import leftIcon from '$lib/assets/angles-left.svg?raw';
  import rightIcon from '$lib/assets/angles-right.svg?raw';

  interface Props {
    prev?: string;
    next?: string;
  }

  let { prev, next }: Props = $props();
</script>

<div class="flex justify-between items-center mt-auto pt-4 border-t border-border">
  {#if prev}
    <a href={prev} class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent transition-colors duration-200 hover:bg-surface text-text-primary fill-current" aria-label="Previous Lesson">
      <span class="w-6 h-6 block [&>svg]:w-full [&>svg]:h-full [&>svg]:block">{@html leftIcon}</span>
    </a>
  {:else}
    <div class="flex items-center justify-center w-10 h-10 text-text-secondary opacity-30 cursor-not-allowed fill-current" aria-hidden="true">
      <span class="w-6 h-6 block [&>svg]:w-full [&>svg]:h-full [&>svg]:block">{@html leftIcon}</span>
    </div>
  {/if}

  {#if next}
    <a href={next} class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent transition-colors duration-200 hover:bg-surface text-text-primary fill-current" aria-label="Next Lesson">
      <span class="w-6 h-6 block [&>svg]:w-full [&>svg]:h-full [&>svg]:block">{@html rightIcon}</span>
    </a>
  {:else}
    <div class="flex items-center justify-center w-10 h-10 text-text-secondary opacity-30 cursor-not-allowed fill-current" aria-hidden="true">
      <span class="w-6 h-6 block [&>svg]:w-full [&>svg]:h-full [&>svg]:block">{@html rightIcon}</span>
    </div>
  {/if}
</div>