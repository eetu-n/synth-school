import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';
import { faustPlugin } from './vite-plugin-faust';

export default defineConfig({
	build: {
		minify: false
	},
	plugins: [
		faustPlugin(),
		tailwindcss(), 
		sveltekit(), 
		wasm(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/@grame/faustwasm/libfaust-wasm/libfaust-wasm.*',
					dest: 'libfaust-wasm'
				}
			]
		})
	]
});
