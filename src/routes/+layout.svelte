<script lang="ts">
    import { browser } from '$app/environment';
    import "../app.css"
    import favicon from "$lib/assets/favicon.svg";
    import AudioContextManager from "$lib/audioFramework/AudioContextManager.svelte";
    import FaustMasterMixer from "$lib/audioComponents/FaustMasterMixer.svelte";
    import { audioState } from "$lib/audioFramework/audioState.svelte";
    import FaustNode from '$lib/audioFramework/FaustNode';
    import RouterNode from '$lib/audioFramework/RouterNode';

    import closeIcon from '$lib/assets/angle-up.svg?raw';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    const headerHeight = 4;

    let { children } = $props();
    let headerExpanded = $state(true);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Synth School</title>
</svelte:head>

<div class="flex flex-col h-screen w-screen relative">
    <header 
        class="flex-shrink-0 relative bg-surface border-b border-border shadow-md z-10 transition-all duration-300 ease-in-out overflow-hidden"
        class:h-16={headerExpanded}
        class:h-0={!headerExpanded}
        class:border-b-0={!headerExpanded}
    >
        <div class="py-4 px-6">
            <div class="flex items-center gap-6">
                {#if browser}
                    <AudioContextManager />
                    <FaustMasterMixer bind:masterNode={audioState.masterNode as FaustNode} bind:preNode={audioState.preMasterNode as RouterNode} bind:destinationNode={audioState.destinationNode as RoutedAudioNode<AudioDestinationNode>} />
                {/if}
            </div>
        </div>
    </header>

    <button 
        class="absolute right-2 bg-surface border border-border border-t-0 rounded-bl-md rounded-br-md cursor-pointer py-1 px-3 z-[101] transition-all duration-300 ease-in-out"
        class:top-[4.9em]={headerExpanded}
        class:top-0={!headerExpanded}
        onclick={() => headerExpanded = !headerExpanded}
        aria-label="Toggle Header"
    >
        <div 
            class="flex items-center justify-center transition-transform duration-300 ease"
            class:rotate-180={!headerExpanded}
        >
            <div class="w-3.5 h-3.5">
                {@html closeIcon}
            </div>
        </div>
    </button>

    <div class="flex-grow overflow-y-auto relative flex flex-col">
        {@render children()}
    </div>
</div>