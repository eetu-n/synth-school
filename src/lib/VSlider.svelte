<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        value?: number;
        min?: number | string;
        max?: number | string;
        step?: number | string;
    }

    let { value = $bindable(0), min = 0, max = 1, step = 0.01, ...rest }: Props = $props();
</script>

<style>
    .vslider {
        writing-mode: vertical-lr;
        direction: rtl;
        appearance: slider-vertical;
    }
</style>

<input 
    type="range" 
    class="vslider" 
    {min}
    {max}
    {step}
    bind:value
    {...rest}
/>
