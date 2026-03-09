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
    .hslider {
        writing-mode: horizontal-lr;
        direction: ltr;
        appearance: slider-horizontal;
    }
</style>

<input 
    type="range" 
    class="hslider" 
    {min}
    {max}
    {step}
    bind:value
    {...rest}
/>
