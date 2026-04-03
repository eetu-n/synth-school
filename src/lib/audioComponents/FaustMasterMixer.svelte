<script lang="ts">
    import FaustNode from "$lib/audioFramework/FaustNode";
    import { getAudioContext } from "$lib/audioFramework/audioContextManager";
    import HSlider from "$lib/uiComponents/HSlider.svelte";

    import mutedIcon from "$lib/assets/volume-xmark-solid-full.svg?raw";
    import volumeLowIcon from "$lib/assets/volume-low-solid-full.svg?raw";
    import volumeMidIcon from "$lib/assets/volume-solid-full.svg?raw";
    import volumeHighIcon from "$lib/assets/volume-high-solid-full.svg?raw";
    import RoutedAudioNode from "$lib/audioFramework/RoutedAudioNode";
    import RouterNode from "$lib/audioFramework/RouterNode";

    let {
        masterNode = $bindable(),
        preNode = $bindable(),
        destinationNode = $bindable(),
    }: {
        masterNode: FaustNode | null;
        preNode: RouterNode | null;
        destinationNode: RoutedAudioNode<AudioDestinationNode> | null;
    } = $props();

    let gain = $state(0.9);
    let mute = $state(false);

    $effect(() => {
        let active = true;
        (async () => {
            let context = await getAudioContext();
            if (!active) return;

            masterNode = (await FaustNode.create("master_mixer", context)) as FaustNode;
            preNode = new RouterNode("pre_master_router", context);
            destinationNode = new RoutedAudioNode(
                "destination",
                context,
                context.destination,
            );

            if (masterNode && preNode) preNode.connect(masterNode);
            if (masterNode && destinationNode) masterNode.connect(destinationNode);

            masterNode.setParamValue("Gain", gain);
            masterNode.setParamValue("Mute", mute ? 1 : 0);
        })();

        return () => {
            active = false;
            masterNode?.destroy();
        };
    });

    function handleGainChange() {
        if (!masterNode) return;

        masterNode.setParamValue("Gain", gain);

        mute = gain === 0;
    }

    $effect(() => {
        if (!masterNode) return;

        masterNode.setParamValue("Mute", mute ? 1 : 0);
    });
</script>

<div style="display: flex; align-items: center;">
    <button
        class="mute-button"
        onclick={() => (mute = !mute)}
        style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem; padding: 0;"
    >
        {#if mute}
            {@html mutedIcon}
        {:else if gain < 0.2}
            {@html volumeLowIcon}
        {:else if gain > 0.8}
            {@html volumeHighIcon}
        {:else}
            {@html volumeMidIcon}
        {/if}
    </button>
    <HSlider oninput={handleGainChange} bind:value={gain} />
</div>

<style>
    .mute-button {
        width: 1.5em;
        height: 1.5em;

        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
    }
    .mute-button :global(svg) {
        width: auto;
        height: 1em;
        display: block;
    }
</style>
