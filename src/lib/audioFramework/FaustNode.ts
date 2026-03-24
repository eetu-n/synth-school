import { 
    FaustAudioWorkletNode, 
    FaustMonoDspGenerator, 
    FaustPolyDspGenerator, 
    FaustWasmInstantiator
} from '@grame/faustwasm/dist/esm/index.js';
import RoutedAudioNode from './RoutedAudioNode.ts';

const devDspImporters = import.meta.glob('/src/lib/dsp/*.dsp', { query: '?url' });
const prodJsonImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp-meta.json');
const prodWasmImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp-module.wasm', { query: '?url' });
const prodMixerImporters = import.meta.glob('/src/lib/dsp/generated/*/mixer-module.wasm', { query: '?url' });

export class FaustNode extends RoutedAudioNode{
    started: boolean = false;
    error: string | null = null;
    private targetOutput: AudioNode | FaustAudioWorkletNode | null = null;

    private constructor(name: string, context: AudioContext, workletNode: FaustAudioWorkletNode, inputs = [], outputs = []) {
        super(name, context, workletNode, inputs, outputs);
    }

    async create(name: string, context: AudioContext, inputs = [], outputs = []) {
        let worklet = await FaustNode.createWorkletNode(name, context);
        return new FaustNode(name, context, worklet, inputs, outputs);
    }

    setParamValue(param: string, value: number) {
        if (this.audioNode) {
            this.audioNode.setParamValue("/" + this.name + "/" + param, value);
        }
    }

    getParamValue(param: string): number {
        if (this.audioNode) {
            return this.audioNode.getParamValue("/" + this.name + "/" + param);
        }
        return 0;
    }

    static async createWorkletNode(name: string, context: AudioContext): Promise<FaustAudioWorkletNode | null > {
        if (context.state !== 'running') {
            console.error("AudioContext not running. State: ${this.context.state}");
            return null;
        }

        let factory;
        let createdNode;

        try {
            if (import.meta.env.DEV) {
                console.log(`DEV: Loading DSP for ${this.name}...`);
                const dspPath = `/src/lib/dsp/${this.name}.dsp`;
                const importer = devDspImporters[dspPath];
                if (!importer) throw new Error(`[DEV] DSP file not found for name: ${this.name}. Looked for ${dspPath}`);

                const dspUrl = (await importer() as any).default;
                console.log(`DEV: Compiling ${dspUrl}...`);

                const { compile } = await import('./compile-faust.ts');
                const { wasm, meta, isPoly, nvoices, mixerBuffer } = await compile(dspUrl);

                const wasmBlob = new Blob([wasm as any], { type: 'application/wasm' });
                const wasmBlobUrl = URL.createObjectURL(wasmBlob);
                const jsonBlob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
                const jsonBlobUrl = URL.createObjectURL(jsonBlob);

                factory = await FaustWasmInstantiator.loadDSPFactory(wasmBlobUrl, jsonBlobUrl);

                URL.revokeObjectURL(wasmBlobUrl);
                URL.revokeObjectURL(jsonBlobUrl);

                if (isPoly) {
                    const generator = new FaustPolyDspGenerator();
                    const mixerModule = await WebAssembly.compile(mixerBuffer! as any);
                    createdNode = await generator.createNode(context, nvoices, this.name, factory, mixerModule);
                } else {
                    const generator = new FaustMonoDspGenerator();
                    createdNode = await generator.createNode(context, this.name, factory);
                }

            } else {
                const jsonPath = `/src/lib/dsp/generated/${this.name}/dsp-meta.json`;
                const wasmPath = `/src/lib/dsp/generated/${this.name}/dsp-module.wasm`;
                const mixerPath = `/src/lib/dsp/generated/${this.name}/mixer-module.wasm`;

                const jsonImporter = prodJsonImporters[jsonPath];
                const wasmImporter = prodWasmImporters[wasmPath];
                const mixerImporter = prodMixerImporters[mixerPath];

                if (!jsonImporter || !wasmImporter) {
                    throw new Error(`[PROD] Production assets not found for name: ${this.name}.`);
                }

                console.log(`PROD: Loading pre-compiled DSP for ${this.name}...`);
                const prodJson = (await jsonImporter() as any).default;
                const prodWasmUrl = (await wasmImporter() as any).default;

                const json_blob = new Blob([JSON.stringify(prodJson)], { type: 'application/json' });
                const json_url = URL.createObjectURL(json_blob);
                factory = await FaustWasmInstantiator.loadDSPFactory(prodWasmUrl, json_url);
                URL.revokeObjectURL(json_url);

                if (mixerImporter) {
                    const generator = new FaustPolyDspGenerator();
                    const mixerUrl = (await mixerImporter() as any).default;
                    const mixerModule = await FaustWasmInstantiator.loadDSPMixer(mixerUrl);

                    const optionsMetadata = prodJson.meta?.find((m: any) => m.options);
                    const nvoicesMatch = optionsMetadata?.options?.match(/\[nvoices:\s*(\d+)\]/);
                    const nvoices = nvoicesMatch ? parseInt(nvoicesMatch[1], 10) : 1;

                    createdNode = await generator.createNode(context, nvoices, this.name, factory, mixerModule);
                } else {
                    const generator = new FaustMonoDspGenerator();
                    createdNode = await generator.createNode(context, this.name, factory);
                }
            }

            if (createdNode) {
                return createdNode as FaustAudioWorkletNode;
                // Hook up the Web MIDI API to the Faust Node
                //if (navigator.requestMIDIAccess) {
                //    navigator.requestMIDIAccess().then(midiAccess => {
                //        for (const input of midiAccess.inputs.values()) {
                //            input.onmidimessage = (e) => {
                //                if (createdNode && e.data) {
                //                    createdNode.midiMessage(e.data);
                //                }
                //            };
                //        }
                //    }).catch(err => console.error("Failed to get MIDI access:", err));
                //}

            } else {
                throw new Error("Failed to create Faust audio node.");
            }

        } catch (e: any) {
            console.error(`Error loading Faust node for ${name}:`, e);
        }
    }
}