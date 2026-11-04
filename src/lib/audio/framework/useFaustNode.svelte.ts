import FaustNode from "$lib/audio/framework/FaustNode";
import type RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
import { getAudioContext } from "$lib/audio/framework/audioContextManager";

export interface UseFaustNodeOptions {
  outputNode?: () => RoutedAudioNode<any> | null | undefined;
}

export function useFaustNode(
  dspName: string,
  outputNodeOrOptions?: (() => RoutedAudioNode<any> | null | undefined) | UseFaustNodeOptions
) {
  let node = $state<FaustNode | null>(null);

  const getOutput =
    typeof outputNodeOrOptions === "function"
      ? outputNodeOrOptions
      : outputNodeOrOptions?.outputNode;

  $effect(() => {
    let activeNode: FaustNode | null = null;
    let isDestroyed = false;

    async function init() {
      const context = await getAudioContext();
      if (isDestroyed) return;

      const created = await FaustNode.create(dspName, context);
      if (isDestroyed) {
        created?.destroy();
        return;
      }
      node = created;
      activeNode = created;
    }

    init();

    return () => {
      isDestroyed = true;
      activeNode?.destroy();
      node = null;
    };
  });

  if (getOutput) {
    $effect(() => {
      const currentOutput = getOutput();
      if (node && currentOutput) {
        node.connect(currentOutput);
        return () => node?.disconnect(currentOutput);
      }
    });
  }

  return {
    get current() {
      return node;
    },
    setParam(param: string, value: number | boolean) {
      node?.setParamValue(param, typeof value === "boolean" ? (value ? 1 : 0) : value);
    },
  };
}
