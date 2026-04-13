<script lang="ts" module>
    let helpShownInSession = false;
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { slide } from 'svelte/transition';
    import ResponsiveText from './ResponsiveText.svelte';
    import katex from "katex";
    import { delegate } from 'tippy.js';
    import 'tippy.js/dist/tippy.css';

    let { math = "", displayMode = false } = $props();

    let container = $state<HTMLElement>();
    let mounted = $state(false);
    let showHelp = $state(false);

    if (browser && !helpShownInSession && !localStorage.getItem('katex-tooltip-help-seen')) {
        showHelp = true;
        helpShownInSession = true;
    }

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

    function dismissHelp() {
        showHelp = false;
        localStorage.setItem('katex-tooltip-help-seen', 'true');
    }
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

{#if showHelp}
    <div 
        transition:slide={{ axis: 'y' }}
        class="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface-val)] border border-[var(--color-border-val)] shadow-2xl rounded-full py-2 px-5 flex items-center gap-3 w-fit max-w-[calc(100%-2rem)]"
    >
        <div class="text-xs sm:text-sm text-[var(--color-text-secondary-val)] whitespace-nowrap">
            <span class="font-bold text-[var(--color-primary-val)]">Tip:</span> <ResponsiveText mobileText="Tap" desktopText="Hover over" /> most math symbols for definitions
        </div>
        <button 
            onclick={dismissHelp}
            class="!bg-transparent !p-0 !text-[var(--color-text-secondary-val)] hover:!text-[var(--color-text-primary-val)] transition-colors flex items-center justify-center -mr-1"
            aria-label="Dismiss"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
    </div>
{/if}

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