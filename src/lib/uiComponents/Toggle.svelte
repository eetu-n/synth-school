<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        checked?: boolean;
        colored?: boolean;
    }

    let { checked = $bindable(false), colored = false, children, ...rest }: Props = $props();
</script>

<label class="inline-flex items-center gap-[0.5em] cursor-pointer">
    <div class="relative inline-block w-[2em] h-[1.1em] flex-shrink-0">
        <input 
            type="checkbox" 
            class="peer opacity-0 w-0 h-0 absolute"
            bind:checked={checked}
            {...rest}
        />
        <span 
            class="absolute top-0 left-0 right-0 bottom-0 bg-slider-track transition-all duration-400 rounded-[1.1em]
                   before:absolute before:content-[''] before:h-[0.9em] before:w-[0.9em] before:left-[0.1em] before:bottom-[0.1em] 
                   before:bg-text-primary before:transition-all before:duration-200 before:rounded-full
                   peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-offset-2
                   peer-checked:before:translate-x-[0.9em]"
            class:peer-checked:bg-primary={colored}
            class:peer-checked:bg-slider-track={!colored}
            class:peer-focus-visible:outline-primary={colored}
            class:peer-focus-visible:outline-slider-track={!colored}
        ></span>
    </div>
    {#if children}
        {@render children()}
    {/if}
</label>

