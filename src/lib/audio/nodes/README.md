# Audio Nodes (`src/lib/audio/nodes`)

Custom audio graph nodes and analysis utilities supplementing standard Web Audio and Faust nodes.

---

## File Breakdown

### [`CascadingFilterNode.ts`](CascadingFilterNode.ts)
A composite filter node extending `RoutedAudioNode` that chains up to 4 native `BiquadFilterNode`s in series:
- **Variable Slopes**:
  - `slope = 1`: 12 dB/oct (1 biquad stage)
  - `slope = 2`: 24 dB/oct (2 biquad stages in series)
  - `slope = 4`: 48 dB/oct (4 biquad stages in series)
- **Supported Filter Types**: Lowpass, highpass, and bandpass.
- **Dynamic Routing**: Internal tapping so that the active output is taken from the stage corresponding to the selected slope (`activeFilter`), allowing live switching between filter slopes without glitching.
- **`getLineData()`**: Directly returns frequency response magnitude data for plotting in `Frequency.svelte`.

### [`FilterResponseAnalyzer.ts`](FilterResponseAnalyzer.ts)
Math and analysis utility for calculating theoretical filter curves and band regions:
- **`getResponseLineData(filterNode, numPoints, fMin, fMax, cascade)`**: Queries `getFrequencyResponse` from a Web Audio filter node across logarithmically spaced frequency bins, scales by the cascade count, and returns normalized $(f, \text{value})$ points for visualizers.
- **`getBandRegions(type, cutoff, q, slope)`**: Calculates frequency boundary ranges for educational visualization:
  - **Passband** (frequencies allowed through)
  - **Transition band** (slope region between cutoff and stopband)
  - **Stopband** (frequencies attenuated)
  - Used by `Frequency.svelte` to draw labeled background highlight bands in the filter lessons.
