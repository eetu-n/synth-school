<script lang="ts">
  import leftIcon from '$lib/assets/left.svg';
  import rightIcon from '$lib/assets/right.svg';

  interface Props {
    prev?: string;
    next?: string;
  }

  let { prev, next }: Props = $props();
</script>

<div class="lesson-navigation">
  {#if prev}
    <a href={prev} class="nav-button" aria-label="Previous Lesson">
      <img src={leftIcon} alt="<" />
    </a>
  {:else}
    <div class="nav-spacer"></div>
  {/if}

  {#if next}
    <a href={next} class="nav-button" aria-label="Next Lesson">
      <img src={rightIcon} alt=">" />
    </a>
  {:else}
    <div class="nav-spacer"></div>
  {/if}
</div>

<style>
  .lesson-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }

  .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: transparent;
    transition: background-color 0.2s;
  }

  .nav-button:hover {
    background-color: var(--surface-color);
  }

  .nav-button img {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-spacer {
    width: 2.5rem;
  }
</style>