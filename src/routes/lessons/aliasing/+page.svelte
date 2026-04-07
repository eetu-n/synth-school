<script lang="ts">
    import FaustSawSelector from '$lib/audioComponents/FaustSawSelector.svelte';
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import Frequency from '$lib/analyzerComponents/Frequency.svelte';
    import Scope from '$lib/analyzerComponents/Scope.svelte';
    import VSplitDiv from '$lib/uiComponents/VSplitDiv.svelte';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';
    import RouterNode from '$lib/audioFramework/RouterNode';
    import RoutingGraph from '$lib/uiComponents/RoutingGraph.svelte';
    import Toggle from '$lib/uiComponents/Toggle.svelte';

    var rightIsAliasing = $state(Math.random() < 0.5);

    var selected: "A" | "B" | null = $state(null);
    var showRoutingGraph = $state(false);

    function setSelected(newSelected: "A" | "B") {
        selected = newSelected;
        setTimeout(() => {
            rightIsAliasing = Math.random() < 0.5;
            selected = null;
        }, 1000);
    }

</script>


<VSplitDiv leftSide={leftSide} rightSide={rightSide} />

{#snippet leftSide()}
    <h1>Aliasing</h1>
    <p>
        Which of these two oscillators has more aliasing?
    </p>
    {#if !selected }
        Choose one
    {:else if selected === 'A' && !rightIsAliasing}
        Correct!
    {:else if selected === 'B' && rightIsAliasing}
        Correct!
    {:else}
        Wrong!
    {/if}
    <div>
        <button onclick={() => setSelected('A')}>A</button>
        <button onclick={() => setSelected('B')}>B</button>
    </div>
{/snippet}

{#snippet rightSide()}
    <div style="display: flex; justify-content: flex-end; padding: 1rem 2rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; color: #666;">
            <span>Routing Graph</span>
            <Toggle bind:checked={showRoutingGraph} />
        </label>
    </div>
    {#if audioState.context != null && audioState.masterNode != null}
        <div class=centered>
            <FaustSawSelector outputNode={audioState.preMasterNode as RouterNode} isRightAliasing={rightIsAliasing} />

            <Scope inputNode={audioState.preMasterNode as RoutedAudioNode}/>
            <Frequency inputNode={audioState.preMasterNode as RoutedAudioNode}/>
        </div>
        {#if showRoutingGraph}
            <RoutingGraph startNode={audioState.preMasterNode} />
        {/if}
    {:else}
        <p class=centered>
            Start audio engine from the top left 
        </p>
    {/if}
{/snippet}