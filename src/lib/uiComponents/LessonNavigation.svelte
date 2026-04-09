<script lang="ts">
  import leftIcon from '$lib/assets/angles-left.svg';
  import rightIcon from '$lib/assets/angles-right.svg';

  interface Props {
    prev?: string;
    next?: string;
  }

  let { prev, next }: Props = $props();
</script>

<div class="flex justify-between items-center mt-8 pt-4 border-t border-border">
  {#if prev}
    <a href={prev} class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent transition-colors duration-200 hover:bg-surface" aria-label="Previous Lesson">
      <img src={leftIcon} alt="<" class="w-6 h-6" />
    </a>
  {:else}
    <div class="w-10"></div>
  {/if}

  {#if next}
    <a href={next} class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent transition-colors duration-200 hover:bg-surface" aria-label="Next Lesson">
      <img src={rightIcon} alt=">" class="w-6 h-6" />
    </a>
  {:else}
    <div class="w-10"></div>
  {/if}
</div>