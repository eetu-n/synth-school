<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    let { inputNode }: { inputNode?: RoutedAudioNode<any> } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let container = $state<HTMLDivElement | null>(null);

    let analyser: RoutedAudioNode<AnalyserNode> | null = null;
    let dataArray: Uint8Array | null = null;
    let drawVisual: number;

    function draw(){
        if (!canvas || !analyser || !dataArray) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        drawVisual = requestAnimationFrame(draw);
        analyser.audioNode?.getByteFrequencyData(dataArray);

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
        
        // Horizontal lines
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

        // Frequency Bars
        context.fillStyle = signalColor;
        context.shadowBlur = 6;
        context.shadowColor = signalColor;

        const sliceWidth = width / dataArray.length;

        if (sliceWidth < 1) {
            // High density: draw single pixel columns
            for (let px = 0; px < width; px++) {
                let max = 0;
                const start = Math.floor(px / sliceWidth);
                const end = Math.floor((px + 1) / sliceWidth);
                for (let i = start; i < end && i < dataArray.length; i++) {
                    if (dataArray[i] > max) max = dataArray[i];
                }
                const barHeight = (max / 255) * (height * 0.85);
                context.fillRect(px, height - barHeight, 1, barHeight);
            }
        } else {
            // Low density: draw bars with small gaps
            let x = 0;
            const gap = sliceWidth > 2 ? 1 : 0;
            const drawWidth = sliceWidth - gap;
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * (height * 0.85);
                context.fillRect(x, height - barHeight, drawWidth, barHeight);
                x += sliceWidth;
            }
        }

        context.shadowBlur = 0;
    }

    $effect(() => {
        if (audioState.context && inputNode) {
            analyser = new RoutedAudioNode(
                "frequency_analyzer",
                audioState.context,
                audioState.context.createAnalyser()
            );
            if (analyser.audioNode){
                // Larger FFT for better frequency resolution
                analyser.audioNode.fftSize = 2 ** 13; 
                dataArray = new Uint8Array(analyser.audioNode.frequencyBinCount);
                inputNode.connect(analyser);
            };

            draw();
        } else {
            analyser = null;
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
