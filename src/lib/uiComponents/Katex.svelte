<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import katex from "katex";
    import { delegate } from 'tippy.js';
    import 'tippy.js/dist/tippy.css';

    let { math = "", displayMode = false } = $props();

    let container = $state();
    let mounted = $state(false);

    const options = {
        throwOnError: false,
        trust: true,
        strict: false, 
        displayMode: displayMode,
        macros: {
            "\\tooltip": "\\htmlData{tippy-content=#2}{\\htmlClass{math-tip cursor-help border-b border-dotted border-gray-400}{#1}}"
        }
    };

    const katexString = $derived.by(() => {
        if (!mounted || !browser) return "";
        try {
            return katex.renderToString(math, options);
        } catch (e) {
            console.error(e);
            return math;
        }
    });

    onMount(() => {
        mounted = true;

        const instance = delegate(container, {
            target: '.math-tip',
            allowHTML: true,
            theme: 'light-border',
            interactive: true,
            appendTo: () => document.body,
            // This function ensures we find the content even if it's on a parent wrapper
            content: (reference) => {
                const attr = 'data-tippy-content';
                // Look at the element itself, or the closest parent that has the attribute
                return reference.getAttribute(attr) || reference.closest(`[${attr}]`)?.getAttribute(attr);
            }
        });

        return () => instance.destroy();
    });
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
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
        border-bottom-width: 1px;
    }
</style>