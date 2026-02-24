<script lang="ts">
    import { FaustAudioWorkletNode, FaustMonoDspGenerator, FaustWasmInstantiator } from '@grame/faustwasm/dist/esm/index.js';
    import { getAudioContext } from './audioContextManager.ts';

    let { name, output = null, worklet = $bindable(), started = $bindable(false), error = $bindable(null) }: {
        name: string,
        output?: FaustAudioWorkletNode | AudioNode | null,
        worklet?: FaustAudioWorkletNode | null,
        started?: boolean,
        error?: string | null
    } = $props();

    let audioContext = $state<AudioContext | null>(null);

    let targetOutput = $derived(output || (audioContext ? audioContext.destination : null));

    $effect(() => {
        if (worklet && targetOutput) {
            worklet.disconnect();
            worklet.connect(targetOutput);
        }
    });

    const devDspImporters = import.meta.glob('/src/lib/dsp/*.dsp', { query: '?url' });
    const prodJsonImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.json');
    const prodWasmImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.wasm', { query: '?url' });

    $effect(() => {
        return () => {
            if (worklet) worklet.destroy();
        };
    });

    export function setParamValue(param: string, value: number) {
        if (worklet) {
            worklet.setParamValue("/" + name + "/" + param, value);
        }
    }

    export async function start() {
        if (started) return;

        error = null;

        try {
            audioContext = await getAudioContext();
        } catch (e: any) {
            console.error('Failed to get audio context', e);
            error = `Failed to get audio context: ${e.message}`;
            return;
        }

        if (audioContext.state !== 'running') {
            error = `AudioContext not running. State: ${audioContext.state}`;
            return;
        }

        let factory;
        const generator = new FaustMonoDspGenerator();

        try {
            if (import.meta.env.DEV) {
                console.log(`DEV: Loading DSP for ${name}...`);
                const dspPath = `/src/lib/dsp/${name}.dsp`;
                const importer = devDspImporters[dspPath];
                if (!importer) throw new Error(`[DEV] DSP file not found for name: ${name}. Looked for ${dspPath}`);

                const dspUrl = (await importer() as any).default;
                console.log(`DEV: Compiling ${dspUrl}...`);
                
                const { compile } = await import('./compile-faust.ts');
                const { wasm, meta } = await compile(dspUrl);

                const wasmBlob = new Blob([wasm as any], { type: 'application/wasm' });
                const wasmBlobUrl = URL.createObjectURL(wasmBlob);
                const jsonBlob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
                const jsonBlobUrl = URL.createObjectURL(jsonBlob);
                
                factory = await FaustWasmInstantiator.loadDSPFactory(wasmBlobUrl, jsonBlobUrl);

                URL.revokeObjectURL(wasmBlobUrl);
                URL.revokeObjectURL(jsonBlobUrl);

            } else {
                const jsonPath = `/src/lib/dsp/generated/${name}/dsp.json`;
                const wasmPath = `/src/lib/dsp/generated/${name}/dsp.wasm`;
                
                const jsonImporter = prodJsonImporters[jsonPath];
                const wasmImporter = prodWasmImporters[wasmPath];

                if (!jsonImporter || !wasmImporter) {
                    throw new Error(`[PROD] Production assets not found for name: ${name}.`);
                }

                console.log(`PROD: Loading pre-compiled DSP for ${name}...`);
                const prodJson = (await jsonImporter() as any).default;
                const prodWasmUrl = (await wasmImporter() as any).default;
                
                const json_blob = new Blob([JSON.stringify(prodJson)], { type: 'application/json' });
                const json_url = URL.createObjectURL(json_blob);
                factory = await FaustWasmInstantiator.loadDSPFactory(prodWasmUrl, json_url);
                URL.revokeObjectURL(json_url);
            }
            
            const createdNode = await generator.createNode(audioContext, name, factory);
            
            if (createdNode) {
                worklet = createdNode;
            } else {
                throw new Error("Failed to create Faust audio node.");
            }

        } catch (e: any) {
            console.error(`Error loading Faust node for ${name}:`, e);
            error = e.message;
        } finally {
            if (worklet) started = true;
        }
    }

    start();
</script>
