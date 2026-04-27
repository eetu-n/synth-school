import { 
    instantiateFaustModuleFromFile, 
    LibFaust, 
    FaustCompiler, 
    FaustMonoDspGenerator,
    FaustPolyDspGenerator
} from "@grame/faustwasm/dist/esm/index.js";
import path from "node:path";
import fs from "node:fs";
import { type Plugin } from "vite";

export function faustPlugin(): Plugin {
    let compiler: FaustCompiler | null = null;
    let libFaust: LibFaust | null = null;
    let compilerPromise: Promise<FaustCompiler> | null = null;
    let isBuild = false;
    const wasmCache = new Map<string, { buffer: Uint8Array, mime: string }>();

    async function getCompiler() {
        if (compiler) return compiler;
        if (compilerPromise) return compilerPromise;

        compilerPromise = (async () => {
            try {
                const compilerPath = path.resolve("node_modules/@grame/faustwasm/libfaust-wasm/libfaust-wasm.js");
                const faustModule = await instantiateFaustModuleFromFile(compilerPath);
                libFaust = new LibFaust(faustModule);
                compiler = new FaustCompiler(libFaust);
                return compiler;
            } catch (e) {
                console.error(`[faust-plugin] Error in getCompiler:`, e);
                compilerPromise = null;
                throw e;
            }
        })();

        return compilerPromise;
    }

    return {
        name: 'vite-plugin-faust',
        configResolved(config) {
            isBuild = config.command === 'build';
        },
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split('?')[0];
                if (url?.startsWith('/@faust-compiled/')) {
                    const name = url.slice('/@faust-compiled/'.length);
                    const cached = wasmCache.get(name);
                    if (cached) {
                        res.setHeader('Content-Type', cached.mime);
                        res.end(cached.buffer);
                        return;
                    }
                }
                next();
            });
        },
        async transform(code: string, id: string) {
            if (!id.endsWith('.dsp')) return null;

            const compiler = await getCompiler();
            const dspName = path.basename(id, '.dsp');
            
            const dir = path.dirname(id);
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.endsWith('.dsp') || file.endsWith('.lib')) {
                    const filePath = path.join(dir, file);
                    this.addWatchFile(filePath);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    compiler.fs().writeFile(file, content);
                }
            }

            const isPoly = code.includes('[nvoices:');
            const hasProcess = /\bprocess\b/.test(code);

            if (!hasProcess) {
                return {
                    code: `export default {}; export const isLibrary = true;`,
                    map: null
                };
            }

            let factory;
            let mixerBuffer;

            try {
                if (isPoly) {
                    const generator = new FaustPolyDspGenerator();
                    const dsp = await generator.compile(compiler, dspName, code, "-O3");
                    factory = dsp?.voiceFactory;
                    mixerBuffer = dsp?.mixerBuffer;
                } else {
                    const generator = new FaustMonoDspGenerator();
                    const dsp = await generator.compile(compiler, dspName, code, "-O3");
                    factory = dsp?.factory;
                }
            } catch (err) {
                console.error(`[faust-plugin] Error compiling Faust DSP ${dspName}:`, err);
                throw err;
            }

            if (!factory) {
                throw new Error(`[faust-plugin] Failed to compile Faust DSP: ${dspName}`);
            }

            let wasmUrl: string;
            let mixerUrl: string | undefined;

            if (isBuild) {
                const wasmRefId = this.emitFile({
                    type: 'asset',
                    name: `${dspName}.wasm`,
                    source: factory.code
                });
                wasmUrl = `import.meta.ROLLUP_FILE_URL_${wasmRefId}`;

                if (mixerBuffer) {
                    const mixerRefId = this.emitFile({
                        type: 'asset',
                        name: `${dspName}-mixer.wasm`,
                        source: mixerBuffer
                    });
                    mixerUrl = `import.meta.ROLLUP_FILE_URL_${mixerRefId}`;
                }
            } else {
                // Dev mode: Store in cache and use virtual URL
                const crypto = await import('node:crypto');
                const hash = crypto.createHash('md5').update(Buffer.from(factory.code)).digest('hex').slice(0, 12);
                const wasmName = `${dspName}-${hash}.wasm`;
                wasmCache.set(wasmName, { buffer: factory.code, mime: 'application/wasm' });
                wasmUrl = `'/@faust-compiled/${wasmName}'`;

                if (mixerBuffer) {
                    const mixerHash = crypto.createHash('md5').update(Buffer.from(mixerBuffer)).digest('hex').slice(0, 12);
                    const mixerName = `${dspName}-mixer-${mixerHash}.wasm`;
                    wasmCache.set(mixerName, { buffer: mixerBuffer, mime: 'application/wasm' });
                    mixerUrl = `'/@faust-compiled/${mixerName}'`;
                }
            }

            const meta = JSON.parse(factory.json);

            return {
                code: `
                    export const dspMeta = ${JSON.stringify(meta)};
                    export const wasmUrl = ${wasmUrl};
                    ${mixerUrl ? `export const mixerUrl = ${mixerUrl};` : ''}
                    export const isPoly = ${isPoly};
                    export default {
                        dspMeta,
                        wasmUrl,
                        ${mixerUrl ? 'mixerUrl,' : ''}
                        isPoly
                    };
                `,
                map: null
            };
        }
    };
}
