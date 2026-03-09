import { 
    FaustAudioWorkletNode, 
    FaustMonoDspGenerator, 
    FaustPolyDspGenerator, 
    FaustWasmInstantiator
} from '@grame/faustwasm/dist/esm/index.js';
import { getAudioContext } from '$lib/audioFramework/audioContextManager';

const devDspImporters = import.meta.glob('/src/lib/dsp/*.dsp', { query: '?url' });
const prodJsonImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.json');
const prodWasmImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.wasm', { query: '?url' });
const prodMixerImporters = import.meta.glob('/src/lib/dsp/generated/*/mixer-module.wasm', { query: '?url' });

export class FaustNode {
    name: string;
    worklet: FaustAudioWorkletNode | null = null;
    audioContext: AudioContext | null = null;
    started: boolean = false;
    error: string | null = null;
    private targetOutput: AudioNode | FaustAudioWorkletNode | null = null;

    constructor(name: string) {
        this.name = name;
    }

    setOutput(output: AudioNode | FaustAudioWorkletNode | null) {
        this.targetOutput = output;
        this.updateConnection();
    }

    private updateConnection() {
        if (!this.worklet) return;

        try {
            this.worklet.disconnect();
        } catch (e) { }

        const dest = this.targetOutput || (this.audioContext ? this.audioContext.destination : null);
        if (dest) {
            this.worklet.connect(dest);
        }
    }

    setParamValue(param: string, value: number) {
        if (this.worklet) {
            this.worklet.setParamValue("/" + this.name + "/" + param, value);
        }
    }

    getParamValue(param: string): number {
        if (this.worklet) {
            return this.worklet.getParamValue("/" + this.name + "/" + param);
        }
        return 0;
    }

    async start(): Promise<void> {
        if (this.started) return;
        this.error = null;

        try {
            this.audioContext = await getAudioContext();
        } catch (e: any) {
            console.error('Failed to get audio context', e);
            this.error = `Failed to get audio context: ${e.message}`;
            return;
        }

        if (this.audioContext.state !== 'running') {
            this.error = `AudioContext not running. State: ${this.audioContext.state}`;
            return;
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
                    createdNode = await generator.createNode(this.audioContext, nvoices, this.name, factory, mixerModule);
                } else {
                    const generator = new FaustMonoDspGenerator();
                    createdNode = await generator.createNode(this.audioContext, this.name, factory);
                }

            } else {
                const jsonPath = `/src/lib/dsp/generated/${this.name}/dsp.json`;
                const wasmPath = `/src/lib/dsp/generated/${this.name}/dsp.wasm`;
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

                    createdNode = await generator.createNode(this.audioContext, nvoices, this.name, factory, mixerModule);
                } else {
                    const generator = new FaustMonoDspGenerator();
                    createdNode = await generator.createNode(this.audioContext, this.name, factory);
                }
            }

            if (createdNode) {
                this.worklet = createdNode as FaustAudioWorkletNode;
                this.updateConnection();

                // Hook up the Web MIDI API to the Faust Node
                if (navigator.requestMIDIAccess) {
                    navigator.requestMIDIAccess().then(midiAccess => {
                        for (const input of midiAccess.inputs.values()) {
                            input.onmidimessage = (e) => {
                                if (this.worklet && e.data) {
                                    this.worklet.midiMessage(e.data);
                                }
                            };
                        }
                    }).catch(err => console.error("Failed to get MIDI access:", err));
                }

            } else {
                throw new Error("Failed to create Faust audio node.");
            }

        } catch (e: any) {
            console.error(`Error loading Faust node for ${this.name}:`, e);
            this.error = e.message;
        } finally {
            if (this.worklet) this.started = true;
        }
    }

    destroy() {
        if (this.worklet) {
            this.worklet.destroy();
            this.worklet = null;
        }
    }
}