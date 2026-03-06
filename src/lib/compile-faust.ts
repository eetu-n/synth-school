import { 
    instantiateFaustModuleFromFile, 
    LibFaust, 
    FaustCompiler, 
    FaustMonoDspGenerator,
    FaustPolyDspGenerator
} from "@grame/faustwasm";

const compilerUrl = "/libfaust-wasm/libfaust-wasm.js"

/**
 * Fetches and compiles a Faust DSP file from a URL into WebAssembly and metadata JSON.
 *
 * @param dspUrl The URL of the .dsp file to fetch and compile.
 * @param compilerUrl The URL to the `libfaust-wasm.js` file required to load the compiler.
 * @returns An object containing the WASM binary (Uint8Array) and the parsed metadata JSON.
 */
export async function compile(dspUrl: string) {
    const dspName = dspUrl.split("/").slice(-1)[0].split(".")[0];
    const response = await fetch(dspUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch DSP file: ${response.statusText}`);
    }
    const dspCode = await response.text();

    const nvoicesMatch = dspCode.match(/\[nvoices:\s*(\d+)\]/);
    const isPoly = !!nvoicesMatch;
    const nvoices = isPoly ? parseInt(nvoicesMatch![1], 10) : 0;

    const faustModule = await instantiateFaustModuleFromFile(compilerUrl);
    const libFaust = new LibFaust(faustModule);
    const compiler = new FaustCompiler(libFaust);

    let factory;
    let generator;

    if (isPoly) {
        generator = new FaustPolyDspGenerator();
        // Compile polyphonic module. effectCode parameter is omitted, so no effect
        await generator.compile(compiler, dspName, dspCode, "-O3");
        factory = generator.voiceFactory; 
    } else {
        generator = new FaustMonoDspGenerator();
        await generator.compile(compiler, dspName, dspCode, "-O3");
        factory = generator.factory;
    }

    if (!factory) {
        throw new Error("Faust compilation failed. Please check the DSP code for syntax errors.");
    }

    // 4. Extract the WASM buffer and metadata JSON
    const wasmBuffer = factory.code;
    const metaJson = JSON.parse(factory.json);
    
    // For polyphonic nodes, we also need to pass back the mixer module 
    // to instantiate the full poly node correctly
    let mixerBuffer = undefined;
    if (isPoly) {
        mixerBuffer = (generator as FaustPolyDspGenerator).mixerBuffer;
    }

    return { 
        wasm: wasmBuffer, 
        meta: metaJson,
        isPoly,
        nvoices,
        mixerBuffer
    };
}