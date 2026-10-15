export interface BandRegion {
    startF: number;
    endF: number;
    label: string;
}

export type FilterType = "lowpass" | "highpass" | "bandpass";

export class FilterResponseAnalyzer {
    private freqArrayCache: Float32Array<ArrayBuffer> | null = null;
    private magResponseCache: Float32Array<ArrayBuffer> | null = null;
    private phaseResponseCache: Float32Array<ArrayBuffer> | null = null;

    private lastFMin: number = 0;
    private lastFMax: number = 0;

    public getResponseLineData(
        filterNode: BiquadFilterNode | IIRFilterNode, 
        numPoints: number = 200, 
        fMin: number = 20, 
        fMax: number = 20000,
        cascade: number = 1
    ): { f: number, value: number }[] {
        if (
            !this.freqArrayCache || 
            this.freqArrayCache.length !== numPoints ||
            this.lastFMin !== fMin ||
            this.lastFMax !== fMax
        ) {
            this.freqArrayCache = new Float32Array(numPoints);
            this.magResponseCache = new Float32Array(numPoints);
            this.phaseResponseCache = new Float32Array(numPoints);
            
            for (let i = 0; i < numPoints; i++) {
                this.freqArrayCache[i] = fMin * Math.pow(fMax / fMin, i / Math.max(1, numPoints - 1));
            }
            
            this.lastFMin = fMin;
            this.lastFMax = fMax;
        }

        const freqArray = this.freqArrayCache!;
        const magResponse = this.magResponseCache!;
        const phaseResponse = this.phaseResponseCache!;

        filterNode.getFrequencyResponse(
            freqArray, 
            magResponse, 
            phaseResponse
        );

        const lineData: { f: number, value: number }[] = [];
        for (let i = 0; i < numPoints; i++) {
            const mag = Math.pow(magResponse[i], cascade);
            const db = mag > 0 ? 20 * Math.log10(mag) : -100;
            // value is normalized: 0.0 represents -40dB, 1.0 represents +20dB.
            const value = (db + 40) / 60;
            lineData.push({ f: freqArray[i], value });
        }

        return lineData;
    }

    public static getBandRegions(
        type: FilterType,
        cutoff: number,
        q: number,
        slope: number
    ): BandRegion[] {
        switch (type) {
            case "lowpass": {
                const stopF = cutoff * Math.pow(2, 2 / slope);
                return [
                    { startF: 0.1,    endF: cutoff,  label: "Passband" },
                    { startF: cutoff, endF: stopF,   label: "Transition Band" },
                    { startF: stopF,  endF: 100000,  label: "Stopband" },
                ];
            }
            case "highpass": {
                const stopF = cutoff / Math.pow(2, 2 / slope);
                return [
                    { startF: 0.1,    endF: stopF,   label: "Stopband" },
                    { startF: stopF,  endF: cutoff,  label: "Transition Band" },
                    { startF: cutoff, endF: 100000,  label: "Passband" },
                ];
            }
            case "bandpass": {
                const bw = cutoff / (q + 1);
                const f1 = cutoff - bw / 2;
                const f2 = cutoff + bw / 2;
                const transMult = Math.pow(2, 1.5 / slope);
                return [
                    { startF: 0.1,            endF: f1 / transMult, label: "Stopband" },
                    { startF: f1 / transMult, endF: f1,             label: "Transition Band" },
                    { startF: f1,             endF: f2,             label: "Passband" },
                    { startF: f2,             endF: f2 * transMult, label: "Transition Band" },
                    { startF: f2 * transMult, endF: 100000,         label: "Stopband" },
                ];
            }
        }
    }
}
