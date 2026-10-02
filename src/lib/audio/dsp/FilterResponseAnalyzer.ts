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
        fMax: number = 20000
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
            const mag = magResponse[i];
            const db = mag > 0 ? 20 * Math.log10(mag) : -100;
            // value is normalized: 0.0 represents -40dB, 1.0 represents +20dB.
            const value = (db + 40) / 60;
            lineData.push({ f: freqArray[i], value });
        }

        return lineData;
    }
}
