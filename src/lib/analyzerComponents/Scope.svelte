<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import { analyzerStyles } from './analyzerStyles';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    let { inputNode }: { inputNode: RoutedAudioNode<any> } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let context = $derived(canvas?.getContext('2d') ?? null);
    let width: number = $derived(canvas?.width ?? 0);
    let height: number = $derived(canvas?.height ?? 0);

    let analyser: RoutedAudioNode<AnalyserNode> | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let drawVisual: number;

    function findTriggerPoint(data: Uint8Array): number {
        let triggerIndex = 0;
        let armed = false;
        const triggerThreshold = 128;
        const hysteresisLevel = 70;

        for (let i = 0; i < data.length; i++) {
            if (!armed && data[i] < hysteresisLevel) {
                armed = true;
            } else if (armed && data[i] >= triggerThreshold) {
                triggerIndex = i;
                break;
            }
        }
        return triggerIndex;
    }

    function findTriggerPointWithAutocorellation(data: Uint8Array): number {
        // Find the mean to remove DC offset
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        const mean = sum / data.length;

        let bestOffset = -1;
        let maxCorrelation = 0;
        let foundMinus = false;
        const halfSize = Math.floor(data.length / 2);

        for (let offset = 0; offset < halfSize; offset++) {
            let correlation = 0;

            for (let i = 0; i < halfSize; i++) {
                const a = data[i] - mean;
                const b = data[i + offset] - mean;
                correlation += a * b;
            }

            if (correlation < 0) {
                foundMinus = true;
            }

            if (foundMinus && correlation > maxCorrelation) {
                maxCorrelation = correlation;
                bestOffset = offset;
            }
        }

        const period = bestOffset === -1 ? 0 : bestOffset;
        
        if (period === 0) {
            return 0;
        }

        // Find min and max in the first period to determine the midpoint
        let min = 255;
        let max = 0;
        for (let i = 0; i < period; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }

        const mid = (min + max) / 2;
        let triggerIndex = 0;
        let maxSlope = -1;

        // Find the positive-going crossing of the midpoint with the steepest slope
        for (let i = 0; i < period; i++) {
            const current = data[i];
            const next = data[i + 1];
            if (current <= mid && next > mid) {
                const slope = next - current;
                if (slope > maxSlope) {
                    maxSlope = slope;
                    triggerIndex = i;
                }
            }
        }

        return triggerIndex;
    }

    function draw(){
        if (!canvas || !analyser || !dataArray || !context || width == 0 || height == 0) return;
        drawVisual = requestAnimationFrame(draw);
        analyser.audioNode?.getByteTimeDomainData(dataArray);

        // Fill solid color
        context.fillStyle = analyzerStyles.colors.background;
        context.fillRect(0, 0, width, height);

        // Draw grid
        context.lineWidth = 1;
        context.strokeStyle = analyzerStyles.colors.grid;
        context.beginPath();
        for (let i = 1; i < 4; i++) {
            context.moveTo(0, (height / 4) * i);
            context.lineTo(width, (height / 4) * i);
        }
        for (let i = 1; i < 8; i++) {
            context.moveTo((width / 8) * i, 0);
            context.lineTo((width / 8) * i, height);
        }
        context.stroke();

        // Begin the path
        context.lineWidth = 2;
        context.strokeStyle = analyzerStyles.colors.signal;
        context.shadowBlur = 8;
        context.shadowColor = analyzerStyles.colors.signal;
        context.beginPath();

        const triggerIndex = findTriggerPointWithAutocorellation(dataArray);

        const drawLength = dataArray.length / 2;
        const sliceWidth = width / drawLength;
        let x = 0;
        
        for (let i = 0; i < drawLength; i++) {
          const sampleIndex = triggerIndex + i;
          // Stop if we run out of samples in the buffer
          if (sampleIndex >= dataArray.length) break;

          const v = dataArray[sampleIndex] / 128.0;
          const y = v * (height / 2);

          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }

          x += sliceWidth;
        }

        // Finish the line
        context.lineTo(width, height / 2);
        context.stroke();
        context.shadowBlur = 0;
    }

    $effect(() => {
        if (audioState.context && inputNode) {
            analyser = new RoutedAudioNode<AnalyserNode>(
                "scope",
                audioState.context,
                audioState.context.createAnalyser()
            );
            if (analyser.audioNode) {
                analyser.audioNode.fftSize = 2048;
                dataArray = new Uint8Array(analyser.audioNode.frequencyBinCount);
                inputNode.connect(analyser);
            };


            if (context) context.clearRect(0, 0, width, height);
            draw();
        }
        

        return () => {
            cancelAnimationFrame(drawVisual);
            if (analyser && inputNode) {
                inputNode.disconnect(analyser);
            }
        };
    });
</script>

<canvas bind:this={canvas} width=400 height=200 style={analyzerStyles.canvasStyle}>

</canvas>
