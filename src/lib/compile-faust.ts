import { 
    instantiateFaustModuleFromFile, 
    LibFaust, 
    FaustCompiler, 
    FaustMonoDspGenerator 
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

    const faustModule = await instantiateFaustModuleFromFile(compilerUrl);
    const libFaust = new LibFaust(faustModule);
    const compiler = new FaustCompiler(libFaust);

    const generator = new FaustMonoDspGenerator();
    
    await generator.compile(compiler, dspName, dspCode, "-O3");
    
    const factory = generator.factory;
    if (!factory) {
        throw new Error("Faust compilation failed. Please check the DSP code for syntax errors.");
    }

    // 4. Extract the WASM buffer and metadata JSON
    // 'factory.code' is a Uint8Array containing the compiled WebAssembly binary
    // 'factory.json' is a JSON string containing the DSP metadata (controls, inputs/outputs, etc.)
    const wasmBuffer = factory.code;
    const metaJson = JSON.parse(factory.json);
    
    return { 
        wasm: wasmBuffer, 
        meta: metaJson 
    };
}