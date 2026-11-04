<script lang="ts">
    import type RoutedAudioNode from '$lib/audio/framework/RoutedAudioNode';
    import { useAudioAnalyser } from '$lib/audio/framework/useAudioAnalyser.svelte';
    import { useDpr } from '$lib/utils/dpr.svelte';

    let { inputNode }: { inputNode: RoutedAudioNode<any> } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let container = $state<HTMLDivElement | null>(null);

    let w = $state(800);
    let h = $state(400);
    const dpr = useDpr();

    const audio = useAudioAnalyser(() => inputNode, { name: "scope", fftSize: 2048 });
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
        if (!canvas) return;
        const dataArray = audio.getTimeDomainData();
        if (!dataArray) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        drawVisual = requestAnimationFrame(draw);

        const width = w;
        const height = h;

        context.save();
        context.scale(dpr.current, dpr.current);

        // Get current colors from CSS variables
        const style = getComputedStyle(canvas);
        const surfaceColor = style.getPropertyValue('--color-surface').trim() || '#1e293b';
        const gridColor = style.getPropertyValue('--color-grid').trim() || '#475569';
        const signalColor = style.getPropertyValue('--color-primary').trim() || '#2dd4bf';

        // Background
        context.fillStyle = surfaceColor;
        context.fillRect(0, 0, width, height);

        // Grid
        context.lineWidth = 1;
        context.strokeStyle = gridColor;
        context.globalAlpha = 0.5;
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
        context.restore();
    }

    $effect(() => {
        if (audio.analyser) {
            draw();
        }
        
        return () => {
            cancelAnimationFrame(drawVisual);
        };
    });
</script>

<div bind:this={container} class="bg-surface rounded-xl shadow-sm border border-border p-6 my-4 w-full max-w-3xl mx-auto flex flex-col">
    <div class="w-full aspect-[2/1] relative" bind:clientWidth={w} bind:clientHeight={h}>
        <canvas
            bind:this={canvas}
            width={Math.floor(w * dpr.current)}
            height={Math.floor(h * dpr.current)}
            style="width: 100%; height: 100%;"
            class="block"
        ></canvas>
    </div>
</div>
