<script lang="ts">
    import FaustNode from "$lib/audio/framework/FaustNode";
    import { getAudioContext } from "$lib/audio/framework/audioContextManager";
    import HSlider from "$lib/components/ui/inputs/HSlider.svelte";

    import mutedIcon from "$lib/assets/volume-mute.svg?raw";
    import volumeLowIcon from "$lib/assets/volume-low.svg?raw";
    import volumeMidIcon from "$lib/assets/volume-mid.svg?raw";
    import volumeHighIcon from "$lib/assets/volume-high.svg?raw";
    import RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
    import RouterNode from "$lib/audio/framework/RouterNode";

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

<div class="flex items-center">
    <button
        class="bg-transparent border-none text-xl cursor-pointer ml-1 sm:ml-4 p-0 w-[1.5em] h-[1.5em] inline-flex items-center justify-start min-h-0 text-gray-300 hover:text-white transition-colors fill-current"
        onclick={() => (mute = !mute)}
    >
        <span class="w-[1em] h-[1em] block [&>svg]:w-full [&>svg]:h-full [&>svg]:block">
            {#if mute}
                {@html mutedIcon}
            {:else if gain < 0.2}
                {@html volumeLowIcon}
            {:else if gain > 0.8}
                {@html volumeHighIcon}
            {:else}
                {@html volumeMidIcon}
            {/if}
        </span>
    </button>
    <div class="hidden sm:block">
        <HSlider oninput={handleGainChange} bind:value={gain} class="header-slider" />
    </div>
</div>

