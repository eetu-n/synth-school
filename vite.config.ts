import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [sveltekit(), wasm(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/@grame/faustwasm/libfaust-wasm/libfaust-wasm.*',
					dest: 'libfaust-wasm'
				}
			]
		}),
		{
      		name: 'watch-dsp',
      		configureServer(server) {
      		  server.watcher.add('./src/lib/dsp/*.dsp');
      		}
    	}
	]
});
