<script lang="ts">
    import FaustSawSelector from '$lib/audioComponents/FaustSawSelector.svelte';
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import Frequency from '$lib/analyzerComponents/Frequency.svelte';
    import Scope from '$lib/analyzerComponents/Scope.svelte';

    var rightIsAliasing = $state(Math.random() < 0.5);

    var selected: "A" | "B" | null = $state(null);

    function setSelected(newSelected: "A" | "B") {
        selected = newSelected;
        setTimeout(() => {
            rightIsAliasing = Math.random() < 0.5;
            selected = null;
        }, 1000);
    }

</script>

<style>
    .centered {
        margin-top: 1rem; 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }
</style>

<div class=centered>
    <h2>Which option has more aliasing?</h2>
    <FaustSawSelector output={audioState.masterWorklet} isRightAliasing={rightIsAliasing} />
    <div>
        <button onclick={() => setSelected('A')}>A</button>
        <button onclick={() => setSelected('B')}>B</button>
    </div>
    {#if !selected }
        Choose one
    {:else if selected === 'A' && !rightIsAliasing}
        Correct!
    {:else if selected === 'B' && rightIsAliasing}
        Correct!
    {:else}
        Wrong!
    {/if}

    <Scope/>
    <Frequency/>
</div>