
<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';

    let canvas = $state<HTMLCanvasElement | null>(null);
    let context = $derived(canvas?.getContext('2d') ?? null);
    let width: number = $derived(canvas?.width ?? 0);
    let height: number = $derived(canvas?.height ?? 0);

    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let barWidth = 0;
    let barHeight = 0;
    let drawVisual: number;

    function draw(){
        if (!canvas || !analyser || !dataArray || !context || width == 0 || height == 0) return;
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        context.fillStyle = "rgb(15, 23, 42)";
        context.fillRect(0, 0, width, height);

        // Draw grid
        context.lineWidth = 1;
        context.strokeStyle = "rgba(255, 255, 255, 0.1)";
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

        let x = 0;

        context.fillStyle = "rgb(34, 211, 238)";
        context.shadowBlur = 4;
        context.shadowColor = "rgb(34, 211, 238)";

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = (dataArray[i] / 255) * (height * 0.9);

            context.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        context.shadowBlur = 0;


    }

    $effect(() => {
        if (audioState.context) {
            analyser = audioState.context.createAnalyser();
            analyser.fftSize = 1024;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            audioState.masterWorklet?.connect(analyser);

            barWidth = width / dataArray.length * 2.5;

            if (context) context.clearRect(0, 0, width, height);
            draw();
        } else {
            analyser = null;
        }

        return () => {
            cancelAnimationFrame(drawVisual);
            if (analyser) {
                audioState.masterWorklet?.disconnect(analyser);
            }
        };
    });
</script>

<canvas bind:this={canvas} width="400" height="200" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid #334155;">

</canvas>
