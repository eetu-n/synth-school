<script lang="ts">
    import { browser } from '$app/environment';
    import "$lib/app.css"
    import favicon from "$lib/assets/favicon.svg";
    import AudioContextManager from "$lib/audioFramework/AudioContextManager.svelte";
    import FaustMasterMixer from "$lib/audioComponents/FaustMasterMixer.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import FaustNode from '$lib/audioFramework/FaustNode';
    import RouterNode from '$lib/audioFramework/RouterNode';

    import closeIcon from '$lib/assets/angle-up-solid-full.svg?raw';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    const headerHeight = 4;

    let { children } = $props();
    let headerExpanded = $state(true);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-container">
    <header class="site-header" class:collapsed={!headerExpanded}>
        <div class="header-content-wrapper">
            <div class="header-content">
                {#if browser}
                    <AudioContextManager />
                    <FaustMasterMixer bind:masterNode={audioState.masterNode as FaustNode} bind:preNode={audioState.preMasterNode as RouterNode} bind:destinationNode={audioState.destinationNode as RoutedAudioNode<AudioDestinationNode>} />
                {/if}
            </div>
        </div>
    </header>

    <button 
        class="toggle-header-button" 
        class:is-collapsed={!headerExpanded}
        onclick={() => headerExpanded = !headerExpanded}
        aria-label="Toggle Header"
    >
        <div class="icon-wrapper" class:flipped={!headerExpanded}>
            {@html closeIcon}
        </div>
    </button>

    <div class="page-content">
        {@render children()}
    </div>
</div>

<style>
    :global(html, body) {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        position: relative;
    }

    .site-header {
        flex-shrink: 0;
        position: relative;
        background-color: #f3f4f6;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        z-index: 100;
        height: 4em; 
        transition: height 0.3s ease-in-out; /* Smoother transition */
        overflow: hidden;
    }
    
    .site-header.collapsed {
        height: 0;
        border-bottom: none;
    }

    .header-content-wrapper {
        padding: 1rem 1.5rem;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .toggle-header-button {
        position: absolute;
        top: 4.9em; 
        right: 0.5rem;
        transform: translateY(0);
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-top: none; /* Looks like a tab hanging down */
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        cursor: pointer;
        padding: 4px 12px;
        z-index: 101;
        transition: top 0.3s ease-in-out;
    }

    /* Move the button up when the header disappears */
    .toggle-header-button.is-collapsed {
        top: 0;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
    }

    /* Vertically flip the icon */
    .icon-wrapper.flipped {
        transform: rotate(180deg);
    }

    /* Clean up SVG sizing if necessary */
    .icon-wrapper :global(svg) {
        width: 14px;
        height: 14px;
    }

    .page-content {
        flex-grow: 1;
        overflow-y: auto;
        position: relative;
        display: flex;
        flex-direction: column;
    }
</style>