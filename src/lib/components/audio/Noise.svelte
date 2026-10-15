<script lang="ts">
  import { getAudioContext } from "$lib/audio/framework/audioContextManager";
  import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
  import FaustNode from "$lib/audio/framework/FaustNode";
  import Toggle from "$lib/components/ui/inputs/Toggle.svelte";

  let {
    outputNode = null,
    faustNode = $bindable<FaustNode | null>(null),
    noiseNode = $bindable<FaustNode | null>(null),
    isPlaying = $bindable(false),
  }: {
    outputNode?: RoutedAudioNode<any> | null;
    faustNode?: FaustNode | null;
    noiseNode?: FaustNode | null;
    isPlaying?: boolean;
  } = $props();

  let internalNode = $state<FaustNode | null>(null);

  $effect(() => {
    let active = true;
    let created: FaustNode | null = null;

    (async () => {
      const ctx = await getAudioContext();
      if (!active) return;

      created = await FaustNode.create("noise", ctx);
      if (active && created) {
        internalNode = created;
        faustNode = created;
        noiseNode = created;
        created.setParamValue("play", isPlaying ? 1 : 0);
      } else {
        created?.destroy();
      }
    })();

    return () => {
      active = false;
      created?.destroy();
      internalNode = null;
      faustNode = null;
      noiseNode = null;
    };
  });

  // Output routing
  $effect(() => {
    if (internalNode && outputNode) {
      const src = internalNode;
      const dst = outputNode;
      src.connect(dst);
      return () => {
        src.disconnect(dst);
      };
    }
  });

  // Sync play state
  $effect(() => {
    internalNode?.setParamValue("play", isPlaying ? 1 : 0);
  });
</script>

<div class="flex items-center justify-center p-2">
  <Toggle colored={true} bind:checked={isPlaying}>Play Noise</Toggle>
</div>
