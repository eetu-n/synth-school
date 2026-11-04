<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    gate?: boolean;
    onGate?: (active: boolean) => void;
    pad?: boolean;
    class?: string;
    children?: Snippet<[{ active: boolean }]>;
    label?: string;
    activeLabel?: string;
    disabled?: boolean;
  }

  let {
    gate = $bindable(false),
    onGate,
    pad = false,
    class: className = "",
    children,
    label,
    activeLabel,
    disabled = false,
  }: Props = $props();

  function setGate(active: boolean) {
    if (disabled) return;
    if (gate !== active) {
      gate = active;
      onGate?.(active);
    }
  }
</script>

<button
  type="button"
  {disabled}
  class="btn btn-primary shadow-md select-none transition-all active:scale-95
         {pad ? 'btn-lg w-full h-24 text-2xl font-black tracking-tighter shadow-lg' : ''}
         {className}"
  style="touch-action: none; -webkit-touch-callout: none;"
  onpointerdown={() => setGate(true)}
  onpointerup={() => setGate(false)}
  onpointerleave={() => setGate(false)}
  oncontextmenu={(e) => e.preventDefault()}
>
  {#if children}
    {@render children({ active: gate })}
  {:else}
    {gate && activeLabel ? activeLabel : label}
  {/if}
</button>
