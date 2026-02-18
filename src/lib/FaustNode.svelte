<script lang="ts">
    import { FaustMonoDspGenerator, FaustWasmInstantiator, type FaustAudioWorkletNode } from '@grame/faustwasm/dist/esm/index.js';
    import { getAudioContext } from './audio';

    interface Props {
        name: string;
        node: FaustAudioWorkletNode | null;
    }
    /**
     * The base name of the DSP file (e.g., "saw_selector").
     * The created Faust audio node instance, bound to the parent.
     */
    let { name, node } = $props<Props>();

    let started = $state(false);
    let loading = $state(false);
    let error = $state<string | null>(null);
    let audioContext: AudioContext | null;

    const devDspImporters = import.meta.glob('/src/lib/dsp/*.dsp', { query: '?url' });
    const prodJsonImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.json');
    const prodWasmImporters = import.meta.glob('/src/lib/dsp/generated/*/dsp.wasm', { query: '?url' });

    $effect(() => {
        return () => {
            if (node) node.destroy();
        };
    });

    export async function start() {
        if (started || loading) return;
        
        loading = true;
        error = null;
        audioContext = getAudioContext();

        if (!audioContext) {
            error = "AudioContext could not be created.";
            loading = false;
            return;
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        let factory;
        const generator = new FaustMonoDspGenerator();

        try {
            if (import.meta.env.DEV) {
                const dspPath = `/src/lib/dsp/${name}.dsp`;
                const importer = devDspImporters[dspPath];
                if (!importer) throw new Error(`[DEV] DSP file not found for name: ${name}. Looked for ${dspPath}`);

                const dspUrl = (await importer() as any).default;
                console.log(`DEV: Compiling ${dspUrl}...`);
                
                const { compile } = await import('./compile-faust.ts');
                const { dspModule, dspMeta } = await compile(dspUrl);

                const wasmBlob = new Blob([dspModule], { type: 'application/wasm' });
                const wasmBlobUrl = URL.createObjectURL(wasmBlob);
                const jsonBlob = new Blob([JSON.stringify(dspMeta)], { type: 'application/json' });
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
                node = createdNode;
                node.connect(audioContext.destination);
            } else {
                throw new Error("Failed to create Faust audio node.");
            }

        } catch (e: any) {
            console.error(`Error loading Faust node for ${name}:`, e);
            error = e.message;
        } finally {
            loading = false;
            if (node) started = true;
        }
    }
</script>

<slot loading={loading} started={started} error={error} start={start} />
