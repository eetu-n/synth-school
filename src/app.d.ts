// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	module "*.dsp" {
		export const dspMeta: any;
		export const wasmUrl: string;
		export const mixerUrl: string | undefined;
		export const isPoly: boolean;
		const defaultExport: {
			dspMeta: any;
			wasmUrl: string;
			mixerUrl?: string;
			isPoly: boolean;
		};
		export default defaultExport;
	}
}

export {};
