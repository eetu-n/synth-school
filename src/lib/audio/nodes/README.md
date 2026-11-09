# Audio Nodes (`src/lib/audio/nodes`)

Custom audio graph nodes and analysis utilities:

- `CascadingFilterNode.ts`: Multi-stage filter chaining native biquads to support variable slopes (12/24/48 dB/oct).
- `FilterResponseAnalyzer.ts`: Response curve and band boundary calculation (passband, transition band, stopband).
