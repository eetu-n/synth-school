# Visualizers (`src/lib/components/ui/viz`)

Real-time audio visualizers, envelope diagrams, and signal plotting components.

---

## File Breakdown

### [`AdsrVis.svelte`](AdsrVis.svelte)
Interactive SVG visualization of an ADSR (Attack, Decay, Sustain, Release) envelope:
- **Continuous Logarithmic Scaling**: Accurately shows 0 ms attacks as vertical jumps while scaling smoothly across 1 ms – 5000 ms.
- **Real-Time Playhead Tracking**: Animated playhead dot tracks through Attack $\to$ Decay $\to$ Sustain $\to$ Release phases in sync with gate triggers.
- **Sustain Capsule**: Animated moving diagonal stripes with soft edge fading representing held sustain time.
- **Theming**: Directly reads `--color-primary`, `--color-secondary`, and `--color-grid` tokens.

### [`Scope.svelte`](Scope.svelte)
Real-time audio oscilloscope rendering the time-domain waveform onto an HTML5 Canvas:
- **Autocorrelation Pitch Tracking**: Uses zero-crossing and autocorrelation to find stable trigger points, preventing jitter and keeping periodic waveforms stationary on screen.
- **High-DPI Retina Support**: Automatically scales internal canvas dimensions using `useDpr()` for sharp rendering on mobile and desktop screens.
- **Audio Lifecycle**: Connects to the audio graph via `useAudioAnalyser()`, pulling time-domain data via `getTimeDomainData()`.
- **60 FPS Loop**: Runs via `requestAnimationFrame` drawing from a Web Audio `AnalyserNode`.

### [`Frequency.svelte`](Frequency.svelte)
Logarithmic real-time spectrum analyzer and filter curve visualizer:
- **Logarithmic FFT Display**: Translates linear FFT bins ($2^{14}$ FFT size) into 20 Hz – 20 kHz logarithmic decades with major grid lines at 100 Hz, 1 kHz, and 10 kHz.
- **Filter Curve Overlay**: Accepts optional `lineData` points (from `CascadingFilterNode`) to overlay theoretical filter response curves and a 0 dB reference line.
- **Band Region Highlighting**: Accepts optional `bandRegions` (from `FilterResponseAnalyzer`) to highlight passband, transition band, and stopband regions with fading labels.
- **Audio Lifecycle & High-DPI**: Uses `useAudioAnalyser()` for automated node routing/frequency data retrieval and `useDpr()` for Retina scaling.

### [`SignalAddition.svelte`](SignalAddition.svelte)
Interactive educational SVG diagram demonstrating additive synthesis:
- Illustrates two distinct sine waves (Signal A and Signal B) being summed vector-by-vector into a composite signal ($A + B$).
- Features step-by-step vector travel animation with staggered transitions.

### [`AliasingChart.svelte`](AliasingChart.svelte)
Educational chart for the Aliasing lesson built with `svelte-chartjs`:
- Compares an original continuous high-frequency signal, discrete sample points at a specified sample rate, and the resulting phantom/aliased signal (Nyquist-Shannon theorem demonstration).

### [`Chart.svelte`](Chart.svelte)
General-purpose reusable line chart component wrapping `svelte-chartjs`:
- Plots numeric arrays or mathematical generator functions $(t \mapsto f(t))$ against linear axes.
- Automatically synchronizes with CSS color custom properties.

### [`RoutingGraph.svelte`](RoutingGraph.svelte)
Interactive audio graph visualizer built with `@xyflow/svelte`:
- Inspects active connections in `RoutedAudioNode` instances and displays node blocks connected by directed edges.
- Useful for debugging and explaining signal flow (e.g. synth $\to$ preMaster $\to$ master $\to$ destination).
