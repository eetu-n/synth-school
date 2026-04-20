<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    let { inputNode }: { inputNode: RoutedAudioNode<any> } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let container = $state<HTMLDivElement | null>(null);
    
    let analyser: RoutedAudioNode<AnalyserNode> | null = null;
    let dataArray: Uint8Array | null = null;
    let drawVisual: number;

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
        if (!canvas || !analyser || !dataArray) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        drawVisual = requestAnimationFrame(draw);
        analyser.audioNode?.getByteTimeDomainData(dataArray);

        const width = canvas.width;
        const height = canvas.height;

        // Get current colors from CSS variables
        const style = getComputedStyle(canvas);
        const surfaceColor = style.getPropertyValue('--color-surface-val').trim() || '#1e293b';
        const gridColor = style.getPropertyValue('--color-border-val').trim() || '#334155';
        const signalColor = style.getPropertyValue('--color-primary-val').trim() || '#2dd4bf';

        // Background
        context.fillStyle = surfaceColor;
        context.fillRect(0, 0, width, height);

        // Grid
        context.lineWidth = 1;
        context.strokeStyle = gridColor;
        context.globalAlpha = 0.4;
        context.beginPath();
        
        // Horizontal lines (Center and quarters)
        for (let i = 1; i < 4; i++) {
            context.moveTo(0, (height / 4) * i);
            context.lineTo(width, (height / 4) * i);
        }
        // Vertical lines
        for (let i = 1; i < 8; i++) {
            const x = (width / 8) * i;
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        context.stroke();
        context.globalAlpha = 1.0;

        // Signal path
        const triggerIndex = findTriggerPointWithAutocorellation(dataArray);
        const drawLength = dataArray.length / 2;
        const sliceWidth = width / drawLength;
        
        context.lineWidth = 3;
        context.strokeStyle = signalColor;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        
        // Signal glow
        context.shadowBlur = 6;
        context.shadowColor = signalColor;

        context.beginPath();
        let x = 0;
        for (let i = 0; i < drawLength; i++) {
            const sampleIndex = triggerIndex + i;
            if (sampleIndex >= dataArray.length) break;

            const v = (dataArray[sampleIndex] - 128) / 128.0;
            const y = (height / 2) - (v * (height * 0.45));

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
            x += sliceWidth;
        }
        context.stroke();
        
        // Reset shadow
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

<div bind:this={container} class="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border dark:border-dark-border p-6 my-4 w-full max-w-3xl mx-auto flex flex-col">
    <div class="w-full aspect-[2/1] relative">
        <canvas 
            bind:this={canvas} 
            width="800" 
            height="400"
            class="w-full h-full block"
        ></canvas>
    </div>
</div>
