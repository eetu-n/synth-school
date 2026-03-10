<script lang="ts">
    import { audioState } from '$lib/audioFramework/audioState.svelte';

    let canvas = $state<HTMLCanvasElement | null>(null);
    let context = $derived(canvas?.getContext('2d') ?? null);
    let width: number = $derived(canvas?.width ?? 0);
    let height: number = $derived(canvas?.height ?? 0);

    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;
    let drawVisual: number;

    function draw(){
        if (!canvas || !analyser || !dataArray || !context || width == 0 || height == 0) return;
        drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        // Fill solid color
        context.fillStyle = "rgb(200 200 200)";
        context.fillRect(0, 0, width, height);
        // Begin the path
        context.lineWidth = 2;
        context.strokeStyle = "rgb(0 0 0)";
        context.beginPath();
        // Draw each point in the waveform
        const sliceWidth = width / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
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
    }

    $effect(() => {
        if (audioState.context) {
            analyser = audioState.context.createAnalyser();
            analyser.fftSize = 2048;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            audioState.masterWorklet?.connect(analyser);

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
