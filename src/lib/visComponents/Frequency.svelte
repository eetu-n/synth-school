
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

        context.fillStyle = "rgb(0 0 0)";
        context.fillRect(0, 0, width, height);

        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;

            context.fillStyle = `rgb(${barHeight + 100} 50 50)`;
            context.fillRect(x, height - barHeight / 2, barWidth, barHeight);

            x += barWidth + 1;
        }


    }

    $effect(() => {
        if (audioState.context) {
            analyser = audioState.context.createAnalyser();
            analyser.fftSize = 2048;
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

<canvas bind:this={canvas} width="400" height="200" style="border: 1px solid black;">

</canvas>
