<script lang="ts">
    import { audioState } from '$lib/audio/framework/audioState.svelte';
    import RoutedAudioNode from '$lib/audio/framework/RoutedAudioNode';

    let { 
        inputNode,
        lineData,
        bandRegions
    }: { 
        inputNode?: RoutedAudioNode<any>,
        lineData?: { f: number, value: number }[],
        bandRegions?: { startF: number, endF: number, label: string }[]
    } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);

    let w = $state(800);
    let h = $state(400);
    let dpr = $state(1);

    $effect(() => {
        if (typeof window !== 'undefined') {
            dpr = window.devicePixelRatio || 1;
        }
    });

    let analyser: RoutedAudioNode<AnalyserNode> | null = null;
    let dataArray: Uint8Array<any> | null = null;
    let drawVisual: number;

    const fMin = 20;
    const fMax = 20000;
    const labels = [
        { f: 100, text: "100Hz" },
        { f: 1000, text: "1kHz" },
        { f: 10000, text: "10kHz" }
    ];

    function getXPos(f: number): string {
        const x = 100 * (Math.log10(f / fMin) / Math.log10(fMax / fMin));
        return `${x}%`;
    }

    function draw(){
        if (!canvas || !analyser || !dataArray || !audioState.context) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        drawVisual = requestAnimationFrame(draw);
        analyser.audioNode?.getByteFrequencyData(dataArray);

        const width = w;
        const height = h;
        const sampleRate = audioState.context.sampleRate;
        const bufferLength = dataArray.length;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.scale(dpr, dpr);

        // Get current colors from CSS variables
        const style = getComputedStyle(canvas);
        const surfaceColor = style.getPropertyValue('--color-surface-val').trim() || '#1e293b';
        const gridColor = style.getPropertyValue('--color-grid-val').trim() || '#475569';
        const signalColor = style.getPropertyValue('--color-primary-val').trim() || '#2dd4bf';

        // Background
        context.fillStyle = surfaceColor;
        context.fillRect(0, 0, width, height);

        // Horizontal Grid Lines
        context.strokeStyle = gridColor;
        for (let i = 1; i < 4; i++) {
            context.lineWidth = i === 2 ? 1.5 : 1; // Center line slightly thicker
            context.globalAlpha = i === 2 ? 0.7 : 0.5;
            context.beginPath();
            const y = (height / 4) * i;
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
        
        // Vertical Grid Lines (Logarithmic)
        for (let decade = 10; decade <= 10000; decade *= 10) {
            for (let i = 1; i <= 9; i++) {
                const f = decade * i;
                if (f < fMin || f > fMax) continue;
                
                const x = width * (Math.log10(f / fMin) / Math.log10(fMax / fMin));
                
                // Major lines (100, 1000, 10000) are prominent
                const isMajor = (i === 1 && (decade === 100 || decade === 1000 || decade === 10000));
                context.lineWidth = isMajor ? 1.5 : 1;
                context.globalAlpha = isMajor ? 0.8 : 0.4;
                
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, height);
                context.stroke();
            }
        }
        context.globalAlpha = 1.0;

        // Frequency Bars (Logarithmic)
        context.fillStyle = signalColor;
        context.shadowBlur = 6;
        context.shadowColor = signalColor;

        for (let x = 0; x < width; x++) {
            const f1 = fMin * Math.pow(fMax / fMin, x / width);
            const f2 = fMin * Math.pow(fMax / fMin, (x + 1) / width);
            
            const i1 = Math.floor(f1 * (analyser.audioNode!.fftSize / sampleRate));
            const i2 = Math.ceil(f2 * (analyser.audioNode!.fftSize / sampleRate));
            
            let max = 0;
            const start = i1;
            const end = Math.max(i1 + 1, i2);
            
            for (let i = start; i < end && i < bufferLength; i++) {
                if (dataArray[i] > max) max = dataArray[i];
            }
            
            if (max > 0) {
                const barHeight = (max / 255) * (height * 0.85);
                context.fillRect(x, height - barHeight, 1, barHeight);
            }
        }

        context.shadowBlur = 0;

        const lineColor = style.getPropertyValue('--color-secondary-val').trim() || style.getPropertyValue('--color-signal-actual-val').trim() || '#f43f5e';

        if (lineData && lineData.length > 0) {
            // Draw 0dB Reference Line
            const y0dB = height - ((40 / 60) * height * 0.85);
            context.beginPath();
            context.strokeStyle = style.getPropertyValue('--color-text-secondary-val').trim() || '#64748b';
            context.lineWidth = 1.5;
            context.globalAlpha = 1.0;
            context.setLineDash([6, 4]);
            context.moveTo(0, y0dB);
            context.lineTo(width, y0dB);
            context.stroke();
            context.setLineDash([]);
            context.globalAlpha = 1.0;

            context.beginPath();
            context.strokeStyle = lineColor;
            context.lineWidth = 2.5;
            
            for (let i = 0; i < lineData.length; i++) {
                const point = lineData[i];
                if (point.f < fMin || point.f > fMax) continue;
                
                const x = width * (Math.log10(point.f / fMin) / Math.log10(fMax / fMin));
                const y = height - (point.value * height * 0.85);
                
                if (i === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
            }
            context.stroke();
        }

        if (bandRegions && bandRegions.length > 0) {
            context.textAlign = "center";
            context.font = "bold 12px sans-serif";
            
            bandRegions.forEach(region => {
                if (region.endF < fMin || region.startF > fMax) return;
                
                const startX = region.startF <= fMin ? 0 : width * (Math.log10(region.startF / fMin) / Math.log10(fMax / fMin));
                const endX = region.endF >= fMax ? width : width * (Math.log10(region.endF / fMin) / Math.log10(fMax / fMin));
                
                let regionColor = "rgba(255, 255, 255, 0.6)";
                const lowerLabel = region.label.toLowerCase();
                if (lowerLabel.includes('passband')) {
                    regionColor = style.getPropertyValue('--color-passband-val').trim() || "rgba(16, 185, 129, 0.8)";
                } else if (lowerLabel.includes('stopband')) {
                    regionColor = style.getPropertyValue('--color-stopband-val').trim() || "rgba(239, 68, 68, 0.8)";
                } else if (lowerLabel.includes('transition')) {
                    regionColor = style.getPropertyValue('--color-transitionband-val').trim() || "rgba(234, 179, 8, 0.8)";
                }

                // Draw separator lines at the boundaries (if not at edges)
                context.beginPath();
                context.strokeStyle = regionColor;
                context.lineWidth = 1.5;
                context.setLineDash([4, 4]);
                
                if (region.startF > fMin && region.startF < fMax) {
                    context.moveTo(startX, 0);
                    context.lineTo(startX, height);
                }
                if (region.endF < fMax && region.endF > fMin) {
                    context.moveTo(endX, 0);
                    context.lineTo(endX, height);
                }
                context.stroke();
                context.setLineDash([]);
                
                // Draw text in the middle of the band
                if (region.label) {
                    const textWidth = context.measureText(region.label).width;
                    if (endX - startX > textWidth + 10) {
                        context.fillStyle = regionColor;
                        const midX = (startX + endX) / 2;
                        context.fillText(region.label, midX, 16);
                    }
                }
            });
        }
        
        context.restore();
    }
    $effect(() => {
        if (audioState.context && inputNode) {
            analyser = new RoutedAudioNode(
                "frequency_analyzer",
                audioState.context,
                audioState.context.createAnalyser()
            );
            if (analyser.audioNode){
                analyser.audioNode.fftSize = 2 ** 14; 
                analyser.audioNode.smoothingTimeConstant = 0.8;
                dataArray = new Uint8Array(analyser.audioNode.frequencyBinCount);
                inputNode.connect(analyser);
            };

            drawVisual = requestAnimationFrame(draw);
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

<div class="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border dark:border-dark-border p-6 my-4 w-full max-w-3xl mx-auto flex flex-col">
    <div class="w-full aspect-[2/1] relative mb-2" bind:clientWidth={w} bind:clientHeight={h}>
        <canvas 
            bind:this={canvas} 
            width={Math.floor(w * dpr)} 
            height={Math.floor(h * dpr)}
            style="width: 100%; height: 100%;"
            class="block"
        ></canvas>
    </div>
    
    <!-- Frequency Labels -->
    <div class="relative w-full h-4 px-0 select-none overflow-hidden">
        {#each labels as label}
            <div 
                class="absolute top-0 -translate-x-1/2 text-[10px] font-bold text-text-secondary uppercase tracking-tight"
                style="left: {getXPos(label.f)}"
            >
                {label.text}
            </div>
        {/each}
    </div>
</div>
