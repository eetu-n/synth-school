<script lang="ts">
    import FaustSawSelector from '$lib/audioComponents/FaustSawSelector.svelte';
    import { audioState } from '$lib/audioFramework/audioState.svelte';
</script>

<style>
    .centered {
        margin-top: 1rem; 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>

<div class=centered>
    <h2>Which option has more aliasing?</h2>
    <FaustSawSelector output={audioState.masterWorklet} />
</div>