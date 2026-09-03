<script lang="ts">
    import { audioState, audioLoadingState } from '$lib/audio/framework/audioState.svelte';
    import { startAudioContext, getAudioContext } from '$lib/audio/framework/audioContextManager';
    import { fade } from 'svelte/transition';

    let { children } = $props();

    let internalLoading = $state(false);
    let error = $state<string | null>(null);

    // Consider both the internal context creation and any pending nodes
    let loading = $derived(internalLoading || audioLoadingState.isLoading);

    // isReady determines when to HIDE the overlay.
    // It requires a context, a master node, AND that nothing is currently loading.
    const isReady = $derived(audioState.context != null && audioState.masterNode != null && !loading);

    async function handleStart() {
        if (internalLoading) return;

        internalLoading = true;
        error = null;

        startAudioContext();

        try {
            await getAudioContext();
        } catch (e: any) {
            error = e.message;
        } finally {
            internalLoading = false;
        }
    }
</script>

<div class="relative w-full h-full min-h-[200px] flex flex-col overflow-hidden">
    {#if audioState.context}
        <div class="flex-grow flex flex-col min-h-0" class:invisible={!isReady}>
            {@render children()}
        </div>
    {/if}

    {#if !isReady}
        <div 
            transition:fade={{ duration: 200 }}
            class="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[3px]"
        >
            <div class="bg-[#1d2b3c] p-8 rounded-2xl border border-white/10 shadow-2xl text-center max-w-xs transform transition-all duration-300 animate-in fade-in zoom-in-95 duration-300">
                <div class="mb-6 flex justify-center">
                    <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse border border-primary/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary fill-current" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                </div>
                
                <h3 class="text-white font-bold text-xl mb-2 tracking-tight">Audio Inactive</h3>

                <button 
                    onclick={handleStart}
                    disabled={loading}
                    class="w-full bg-primary hover:bg-primary-variant disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                    {#if loading}
                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Starting...</span>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Start Audio</span>
                    {/if}
                </button>

                {#if error}
                    <p class="text-red-400 text-xs mt-4 font-medium">{error}</p>
                {/if}
            </div>
        </div>
    {/if}
</div>
