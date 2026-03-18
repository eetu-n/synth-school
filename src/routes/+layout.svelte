<script lang="ts">
    import "$lib/app.css"

    import favicon from "$lib/assets/favicon.svg";

    import AudioContextManager from "$lib/audioFramework/AudioContextManager.svelte";
    import FaustMasterMixer from "$lib/audioComponents/FaustMasterMixer.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";

	import openIcon from '$lib/assets/angle-down-solid-full.svg?raw';
    import closeIcon from '$lib/assets/angle-up-solid-full.svg?raw';

    let { children } = $props();
    let headerExpanded = $state(true);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header" class:collapsed={!headerExpanded}>
    <div class="header-content-wrapper">
        <div class="header-content">
            <AudioContextManager />
            <FaustMasterMixer bind:worklet={audioState.masterWorklet} />
        </div>
    </div>
    <button class="toggle-header-button" onclick={() => headerExpanded = !headerExpanded}>
        {#if headerExpanded}
            {@html closeIcon}
        {:else}
            {@html openIcon}
        {/if}
    </button>
</header>

<div class="page-content" class:header-collapsed={!headerExpanded}>
    {@render children()}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    .site-header {
        position: relative; /* For absolute positioning of the button */
        background-color: #f3f4f6;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        z-index: 100;
        height: 72px; /* Expanded height */
        transition: height 0.1s ease-out;
        overflow: hidden;
    }
    
    .site-header.collapsed {
        height: 20px; /* Collapsed height */
    }

    .header-content-wrapper {
        padding: 1rem 1.5rem;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .toggle-header-button{
        position: absolute;
        bottom: 0;
        right: 1.5rem;
        background: #e5e7eb;
        border: 1px solid #ccc;
        border-bottom: none;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        cursor: pointer;
        line-height: 1;
        padding: 2px 8px;
    }
</style>
