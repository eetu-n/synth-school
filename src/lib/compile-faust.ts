import {
    instantiateFaustModule,
    LibFaust,
    FaustCompiler,
    FaustMonoDspGenerator,
    FaustPolyDspGenerator
} from '@grame/faustwasm';

// Create a single compiler instance, reusing it across multiple calls.
let compilerPromise: Promise<FaustCompiler> | null = null;
const getCompiler = (): Promise<FaustCompiler> => {
    if (!compilerPromise) {
        compilerPromise = (async () => {
            const faustModule = await instantiateFaustModule();
            const libFaust = new LibFaust(faustModule);
            return new FaustCompiler(libFaust);
        })();
    }
    return compilerPromise;
};

/**
 * This loader will be used by the compiler to handle `import` statements in the DSP code
 * by fetching the standard libraries from the official online repository.
 */
const libraryLoader = async (path: string): Promise<string> => {
    try {
        const url = `https://faustlibraries.grame.fr/libs/${path}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            console.error(`Failed to fetch Faust library: ${url}`);
            return `declare error "Failed to load Faust library: ${path}";`;
        }
        return await resp.text();
    } catch (e: any) {
        console.error(e);
        return `declare error "Exception while loading Faust library: ${path}";`;
    }
};

/**
 * Compiles a Faust DSP file from a URL on the client-side.
 * @param dspUrl URL to the .dsp file.
 * @returns Compiled assets.
 */
export async function compile(dspUrl: string): Promise<any> {
    const compiler = await getCompiler();
    const code = await fetch(dspUrl).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${dspUrl}: ${res.statusText}`);
        return res.text();
    });

    const dspName = dspUrl.split('/').pop()?.replace(/\.dsp$/, '') || 'faust';
    const argv = ['-ftz', '2'];
    const isPoly = /\[nvoices:\s*\d+\]/.test(code) || /declare\s+nvoices\s*"\d+";/.test(code);

    let dsp, dspModule, dspMeta, effectModule, effectMeta, mixerModule;

    if (isPoly) {
        const generator = new FaustPolyDspGenerator();
        dsp = await generator.compile(compiler, dspName, code, argv.join(' '), libraryLoader);
        if (!dsp?.voiceFactory) throw new Error(`Failed to compile polyphonic DSP: ${dspName}`);
        
        dspModule = dsp.voiceFactory.code;
        dspMeta = JSON.parse(dsp.voiceFactory.json);
        mixerModule = dsp.mixerBuffer;
        if (dsp.effectFactory) {
            effectModule = dsp.effectFactory.code;
            effectMeta = JSON.parse(dsp.effectFactory.json);
        }
    } else {
        const generator = new FaustMonoDspGenerator();
        dsp = await generator.compile(compiler, dspName, code, argv.join(' '), libraryLoader);
        if (!dsp?.factory) throw new Error(`Failed to compile monophonic DSP: ${dspName}`);
        
        dspModule = dsp.factory.code;
        dspMeta = JSON.parse(dsp.factory.json);
    }
    
    return {
        isPoly,
        dspName,
        dspModule,
        dspMeta,
        effectModule,
        effectMeta,
        mixerModule,
    };
}