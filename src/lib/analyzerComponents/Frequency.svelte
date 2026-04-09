
<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';
    import RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';
    import { analyzerStyles } from './analyzerStyles';

    let { inputNode }: { inputNode?: RoutedAudioNode<any> } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let context = $derived(canvas?.getContext('2d') ?? null);
    let width: number = $derived(canvas?.width ?? 0);
    let height: number = $derived(canvas?.height ?? 0);

    let analyser: RoutedAudioNode<AnalyserNode> | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let drawVisual: number;

    function draw(){
        if (!canvas || !analyser || !dataArray || !context || width == 0 || height == 0) return;
        drawVisual = requestAnimationFrame(draw);
        analyser.audioNode?.getByteFrequencyData(dataArray);

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

        context.fillStyle = analyzerStyles.colors.signal;
        context.shadowBlur = 4;
        context.shadowColor = analyzerStyles.colors.signal;

        const sliceWidth = width / dataArray.length;

        if (sliceWidth < 1) {
            for (let px = 0; px < width; px++) {
                let max = 0;
                const start = Math.floor(px / sliceWidth);
                const end = Math.floor((px + 1) / sliceWidth);
                for (let i = start; i < end && i < dataArray.length; i++) {
                    if (dataArray[i] > max) max = dataArray[i];
                }
                const barHeight = (max / 255) * (height * 0.9);
                context.fillRect(px, height - barHeight, 1, barHeight);
            }
        } else {
            let x = 0;
            const gap = sliceWidth > 2 ? 1 : 0;
            const drawWidth = sliceWidth - gap;
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * (height * 0.9);
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
            )
            if (analyser.audioNode){
                analyser.audioNode.fftSize = 2 ** 15;
                dataArray = new Uint8Array(analyser.audioNode.frequencyBinCount);
                inputNode.connect(analyser);
            };

            if (context) context.clearRect(0, 0, width, height);
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

<canvas bind:this={canvas} width=800 height=200 class="rounded-lg shadow-lg border border-slate-700">

</canvas>
