import { 
    FaustAudioWorkletNode, 
    FaustMonoDspGenerator, 
    FaustPolyDspGenerator, 
    FaustWasmInstantiator
} from '@grame/faustwasm/dist/esm/index.js';
import RoutedAudioNode from './RoutedAudioNode.ts';

export default class FaustNode extends RoutedAudioNode<FaustAudioWorkletNode> {
	started: boolean = false;
	error: string | null = null;

	private constructor(name: string, context: AudioContext, workletNode: FaustAudioWorkletNode) {
		super(name, context, workletNode);
	}

    static async create(name: string, context: AudioContext, inputs = [], outputs = []) {
        const { audioLoadingState } = await import('./audioState.svelte.ts');
        audioLoadingState.increment();
        try {
            let worklet = await FaustNode.createWorkletNode(name, context);
            if (!worklet) {
                return null;
            }
            return new FaustNode(name, context, worklet);
        } finally {
            audioLoadingState.decrement();
        }
    }

    setParamValue(param: string, value: number) {
        if (this.audioNode && this.audioNode instanceof FaustAudioWorkletNode) {
            this.audioNode.setParamValue("/" + this.name + "/" + param, value);
        }
    }

    getParamValue(param: string): number {
        if (this.audioNode && this.audioNode instanceof FaustAudioWorkletNode) {
            return this.audioNode.getParamValue("/" + this.name + "/" + param);
        }
        return 0;
    }

    static async createWorkletNode(name: string, context: AudioContext): Promise<FaustAudioWorkletNode | null > {
        if (context.state !== 'running') {
            console.error(`AudioContext not running. State: ${context.state}`);
            return null;
        }

        try {
            // Use dynamic import for the DSP file, which is handled by our Vite plugin
            const dspModule = await import(`../dsp/${name}.dsp`);
            const { dspMeta, wasmUrl, mixerUrl, isPoly } = dspModule;

            // Create a blob URL for the metadata JSON
            const jsonBlob = new Blob([JSON.stringify(dspMeta)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            
            const factory = await FaustWasmInstantiator.loadDSPFactory(wasmUrl, jsonUrl);
            URL.revokeObjectURL(jsonUrl);

            if (!factory) throw new Error("Failed to load DSP factory.");

            let createdNode;
            if (isPoly) {
                if (!mixerUrl) throw new Error("Mixer URL missing for polyphonic DSP.");
                const generator = new FaustPolyDspGenerator();
                const mixerModule = await FaustWasmInstantiator.loadDSPMixer(mixerUrl);
                
                // Extract nvoices from metadata if possible, or default
                const optionsMetadata = dspMeta.meta?.find((m: any) => m.options);
                const nvoicesMatch = optionsMetadata?.options?.match(/\[nvoices:\s*(\d+)\]/);
                const nvoices = nvoicesMatch ? parseInt(nvoicesMatch[1], 10) : 1;

                createdNode = await generator.createNode(context, nvoices, name, factory, mixerModule);
            } else {
                const generator = new FaustMonoDspGenerator();
                createdNode = await generator.createNode(context, name, factory);
            }

            if (createdNode) {
                return createdNode as FaustAudioWorkletNode;
            } else {
                throw new Error("Failed to create Faust audio node.");
            }

        } catch (e: any) {
            console.error(`Error loading Faust node for ${name}:`, e);
            return null;
        }
    }
}