<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        value?: number;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        width?: number | string;
    }

    let { value = $bindable(0), min = 0, max = 1, step = 0.01, width = 200, ...rest }: Props = $props();
</script>

<input 
    type="range" 
    class="[appearance:slider-horizontal] align-middle" 
    {min}
    {max}
    {step}
    bind:value
    style="width: {typeof width === 'number' ? width + 'px' : width};"
    {...rest}
/>
