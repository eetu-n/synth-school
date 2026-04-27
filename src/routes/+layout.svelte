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
    import sunIcon from '$lib/assets/sun.svg?raw';
    import moonIcon from '$lib/assets/moon.svg?raw';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    let { children } = $props();
    let headerExpanded = $state(true);
    let darkMode = $state(true);

    // Initial load from localStorage or current state of html.dark
    $effect(() => {
        if (browser) {
            // Check if the html element already has 'dark' (set by our script in app.html)
            darkMode = document.documentElement.classList.contains('dark');
        }
    });

    // Sync state changes to DOM and localStorage
    $effect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Synth School</title>
</svelte:head>

<div class="flex flex-col h-screen w-screen relative">
    <header 
        class="flex-shrink-0 relative bg-[#1d2b3c] text-white border-b border-white/10 shadow-md z-10 transition-all duration-300 ease-in-out overflow-hidden"
        class:h-16={headerExpanded}
        class:h-0={!headerExpanded}
        class:border-b-0={!headerExpanded}
    >
        <div class="py-4 px-2 sm:px-6 h-full">
            <div class="flex items-center justify-between gap-2 sm:gap-6 h-full">
                <div class="flex items-center gap-2 sm:gap-6">
                    <a href="/" class="flex-shrink-0 transition-transform hover:scale-110 px-2" aria-label="Go to home page">
                        <img src={favicon} alt="Synth School Home" class="w-8 h-8" />
                    </a>
                    {#if browser}
                        <AudioContextManager />
                        {#if audioState.context}
                            <FaustMasterMixer bind:masterNode={audioState.masterNode as FaustNode} bind:preNode={audioState.preMasterNode as RouterNode} bind:destinationNode={audioState.destinationNode as RoutedAudioNode<AudioDestinationNode>} />
                        {/if}
                    {/if}
                </div>

                <button 
                    onclick={() => darkMode = !darkMode}
                    class="p-2 rounded-full transition-colors duration-200 bg-transparent text-gray-300 hover:bg-white/10"
                    aria-label="Toggle dark mode"
                >
                    <div class="w-5 h-5 fill-current text-white">
                        {#if darkMode}
                            {@html sunIcon}
                        {:else}
                            {@html moonIcon}
                        {/if}
                    </div>
                </button>
            </div>
        </div>
    </header>

    <button 
        class="absolute right-2 bg-[#1d2b3c] text-white border border-white/10 border-t-0 rounded-bl-md rounded-br-md cursor-pointer p-0 px-3 z-[101] transition-all duration-300 ease-in-out h-auto min-h-0"
        class:top-16={headerExpanded}
        class:top-0={!headerExpanded}
        onclick={() => headerExpanded = !headerExpanded}
        aria-label="Toggle Header"
    >
        <div 
            class="flex items-center justify-center transition-transform duration-300 ease fill-current text-white"
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