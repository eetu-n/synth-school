<script lang="ts">
    import { FaustNode } from '$lib/audioFramework/FaustNode';
    import type { FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';

    let { output = null, isRightAliasing = true }: { output?: FaustAudioWorkletNode | AudioNode | null, isRightAliasing?: boolean } = $props();

    let faustNode = new FaustNode("saw_selector");

    let gateA: boolean = $state(false)
    let gateB: boolean = $state(false)

    function handleGateA(input: boolean) {
        gateA = input;
        faustNode.setParamValue(isRightAliasing ? "gate2" : "gate1", gateA? 1 : 0);
    }

    function handleGateB(input: boolean) {
        gateB = input;
        faustNode.setParamValue(isRightAliasing ? "gate1" : "gate2", gateB? 1 : 0);
    }

    $effect(() => {
        faustNode.setOutput(output);
    });

    $effect(() => {
        handleGateA(gateA);
    })

    $effect(() => {
        handleGateB(gateB);
    })

    $effect(() => {
        faustNode.start();
        return () => faustNode.destroy();
    });
</script>

<div>
<button 
  onpointerdown={() => handleGateA(true)} 
  onpointerup={() => handleGateA(false)}
  onpointerleave={() => handleGateA(false)} 
>
  Test A
</button>

<button 
  onpointerdown={() => handleGateB(true)} 
  onpointerup={() => handleGateB(false)}
  onpointerleave={() => handleGateB(false)} 
>
  Test B
</button>
</div>