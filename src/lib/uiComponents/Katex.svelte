<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import katex from "katex";
    import { delegate } from 'tippy.js';
    import 'tippy.js/dist/tippy.css';

    let { math = "", displayMode = false } = $props();

    let container = $state<HTMLElement>();
    let mounted = $state(false);

    const katexString = $derived.by(() => {
        if (!mounted || !browser) return "";
        const options = {
            throwOnError: false,
            trust: true,
            strict: false, 
            displayMode: displayMode,
            macros: {
                "\\tooltip": "\\htmlData{tippy-content=#2}{\\htmlClass{math-tip cursor-help}{#1}}",
                "\\fn": "\\tooltip{f_n}{Nyquist frequency}",
                "\\fnv": "\\tooltip{f_n}{Nyquist frequency: #1Hz}",
                "\\fo": "\\tooltip{f_o}{Original frequency}",
                "\\fov": "\\tooltip{f_o}{Original frequency: #1Hz}",
                "\\fa": "\\tooltip{f_a}{Aliased frequency}",
                "\\fav": "\\tooltip{f_a}{Aliased frequency: #1Hz}"
            }
        };
        try {
            return katex.renderToString(math, options);
        } catch (e) {
            console.error(e);
            return math;
        }
    });

    onMount(() => {
        mounted = true;

        if (!container) return;

        const instance = delegate(container as HTMLElement, {
            target: '.math-tip',
            allowHTML: true,
            theme: 'light-border',
            interactive: true,
            appendTo: () => document.body,
            // This function ensures we find the content even if it's on a parent wrapper
            content: (reference) => {
                const attr = 'data-tippy-content';
                // Look at the element itself, or the closest parent that has the attribute
                return reference.getAttribute(attr) || reference.closest(`[${attr}]`)?.getAttribute(attr) || "";
            }
        });

        return () => {
            if (Array.isArray(instance)) {
                instance.forEach((i: any) => i.destroy());
            } else if (instance && (instance as any).destroy) {
                (instance as any).destroy();
            }
        };
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="/katex/katex.min.css">
</svelte:head>

<span
    bind:this={container} 
    class="{displayMode ? 'block my-4' : 'inline'} leading-none"
>
    {#if mounted}
        {@html katexString}
    {:else}
        <span class="opacity-0">{math}</span>
    {/if}
</span>

<style>
    :global(.katex *) {
        border-color: currentColor;
        box-sizing: content-box;
    }

    :global(.math-tip) {
        display: inline-block;
        line-height: 1;
    }
</style>