<script lang="ts">
    import FaustSawSelector from '$lib/components/audio/FaustSawSelector.svelte';
    import { audioState } from '$lib/audio/framework/audioState.svelte';
    import Frequency from '$lib/components/analyzer/Frequency.svelte';
    import Scope from '$lib/components/analyzer/Scope.svelte';
    import VSplitDiv from '$lib/components/ui/layout/VSplitDiv.svelte';
    import RoutedAudioNode from '$lib/audio/framework/RoutedAudioNode';
    import RouterNode from '$lib/audio/framework/RouterNode';
    import RoutingGraph from '$lib/components/ui/viz/RoutingGraph.svelte';
    import Toggle from '$lib/components/ui/inputs/Toggle.svelte';
    import AudioOverlay from '$lib/components/ui/layout/AudioOverlay.svelte';

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


<VSplitDiv leftSide={leftSide} rightSide={rightSide} prev="/lessons/aliasing/2" />

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
    <div class="mt-4">
        <button class="btn" onclick={() => setSelected('A')}>A</button>
        <button class="btn" onclick={() => setSelected('B')}>B</button>
    </div>
{/snippet}

{#snippet rightSide()}
    <AudioOverlay>
        <div class="flex justify-end py-4 px-8">
            <label class="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
                <span>Routing Graph</span>
                <Toggle bind:checked={showRoutingGraph} />
            </label>
        </div>
        <div class="mt-4 flex flex-col justify-center items-center gap-4">
            {#if audioState.context != null && audioState.masterNode != null}
                <FaustSawSelector outputNode={audioState.preMasterNode as RouterNode} isRightAliasing={rightIsAliasing} />

                <Scope inputNode={audioState.preMasterNode as RoutedAudioNode}/>
                <Frequency inputNode={audioState.preMasterNode as RoutedAudioNode}/>
            {/if}
        </div>
        {#if showRoutingGraph && audioState.context != null && audioState.masterNode != null}
            <RoutingGraph startNode={audioState.preMasterNode} />
        {/if}
    </AudioOverlay>
{/snippet}
