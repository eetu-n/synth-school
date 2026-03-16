<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";

    import AudioContextManager from "$lib/audioFramework/AudioContextManager.svelte";
    import FaustMasterMixer from "$lib/audioComponents/FaustMasterMixer.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
    <div class="header-content">
        <AudioContextManager />
        <FaustMasterMixer bind:worklet={audioState.masterWorklet} />
    </div>
</header>

<div class="page-content">
    {@render children()}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    .page-content {
        max-width: 1200px;
        margin: 0 auto;
        vertical-align: top;
    }

    .site-header {
        top: 0;
        left: 0;
        width: 100%;
        background-color: #f3f4f6;
        vertical-align: top;
        padding-top: 0;
        margin: 0;

        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
</style>
