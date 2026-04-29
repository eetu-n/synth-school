<script lang="ts">
    interface Props {
        freq1?: number;
        freq2?: number;
        amp1?: number;
        amp2?: number;
        numSamples?: number;
    }

    let {
        freq1 = 1,
        freq2 = 2.5,
        amp1 = 0.6,
        amp2 = 0.4,
        numSamples = 15,
    }: Props = $props();

    let isAnimating = $state(false);

    const width = 1000;
    const height = 540;
    const padding = 30;

    const CHART_WIDTH = 380;
    const CHART_HEIGHT = 220;

    const leftX = 60;
    const rightX = 560;

    const chartA_Y = padding;
    const chartB_Y = 290;
    const chartSum_Y = 160;

    const getY = (val: number, centerY: number) =>
        centerY - val * (CHART_HEIGHT / 2.5);

    let samples = $derived.by(() => {
        const arr = [];
        for (let i = 0; i < numSamples; i++) {
            const t = i / (numSamples - 1);
            const v1 = amp1 * Math.sin(2 * Math.PI * freq1 * t);
            const v2 = amp2 * Math.sin(2 * Math.PI * freq2 * t);
            arr.push({ t, v1, v2, vSum: v1 + v2 });
        }
        return arr;
    });

    function getLinePoints(f: number, a: number, startX: number, startY: number) {
        let pts = "";
        const resolution = 100;
        const centerY = startY + CHART_HEIGHT / 2;
        for (let i = 0; i <= resolution; i++) {
            const t = i / resolution;
            const v = a * Math.sin(2 * Math.PI * f * t);
            const x = startX + t * CHART_WIDTH;
            const y = getY(v, centerY);
            pts += `${i === 0 ? "M" : "L"} ${x} ${y} `;
        }
        return pts;
    }

    let linePoints1 = $derived(getLinePoints(freq1, amp1, leftX, chartA_Y));
    let linePoints2 = $derived(getLinePoints(freq2, amp2, leftX, chartB_Y));
    let linePointsSum = $derived.by(() => {
        let pts = "";
        const resolution = 100;
        const centerY = chartSum_Y + CHART_HEIGHT / 2;
        for (let i = 0; i <= resolution; i++) {
            const t = i / resolution;
            const v1 = amp1 * Math.sin(2 * Math.PI * freq1 * t);
            const v2 = amp2 * Math.sin(2 * Math.PI * freq2 * t);
            const x = rightX + t * CHART_WIDTH;
            const y = getY(v1 + v2, centerY);
            pts += `${i === 0 ? "M" : "L"} ${x} ${y} `;
        }
        return pts;
    });
</script>

<div class="bg-surface dark:bg-dark-surface rounded-xl shadow-sm border border-border dark:border-dark-border p-6 my-4 w-full max-w-5xl mx-auto flex flex-col items-center">
    <div class="w-full relative">
        <div 
            class="absolute pointer-events-none flex justify-center" 
            style="left: 56%; width: 38%; top: 16%; transform: translateY(-100%);"
        >
            <button
                onclick={() => (isAnimating = !isAnimating)}
                class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-variant transition-colors pointer-events-auto shadow-md"
            >
                {isAnimating ? "Reset" : "Show Addition"}
            </button>
        </div>
        <svg
            viewBox="0 0 {width} {height}"
            class="w-full h-auto overflow-visible select-none"
        >
            <!-- Grid Lines and Labels -->
            {#snippet yAxis(startX, centerY)}
                {#each [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2] as val}
                    {@const y = getY(val, centerY)}
                    {#if y >= centerY - CHART_HEIGHT / 2 - 2 && y <= centerY + CHART_HEIGHT / 2 + 2}
                        <line
                            x1={startX} y1={y}
                            x2={startX + CHART_WIDTH} y2={y}
                            stroke="var(--color-grid-val)"
                            stroke-width="1"
                            stroke-dasharray={val === 0 ? "4" : "2"}
                            opacity={val === 0 ? "0.8" : "0.35"}
                        />
                        {#if Number.isInteger(val)}
                            <text
                                x={startX - 8} y={y + 4}
                                text-anchor="end"
                                class="text-[12px] fill-text-secondary font-medium"
                                >{val}</text
                            >
                        {/if}
                    {/if}
                {/each}
            {/snippet}

            {#snippet chartBox(startX, startY, label)}
                <rect
                    x={startX} y={startY}
                    width={CHART_WIDTH} height={CHART_HEIGHT}
                    fill="none"
                    stroke="var(--color-grid-val)"
                    stroke-width="1"
                    rx="8"
                />
                <text
                    x={startX + 10} y={startY + 25}
                    class="text-[14px] font-bold fill-text-secondary uppercase tracking-wider"
                    >{label}</text
                >
                {@render yAxis(startX, startY + CHART_HEIGHT / 2)}
            {/snippet}

            {#snippet vector(x, yStart, yEnd, color, opacity = 1)}
                {@const headSize = 6}
                {@const direction = yEnd < yStart ? 1 : -1}
                <line
                    x1={x} y1={yStart}
                    x2={x} y2={yEnd}
                    stroke={color}
                    stroke-width="2"
                    {opacity}
                />
                <path
                    d="M {x - headSize / 2} {yEnd + headSize * direction} L {x} {yEnd} L {x + headSize / 2} {yEnd + headSize * direction}"
                    fill="none"
                    stroke={color}
                    stroke-width="2"
                    {opacity}
                />
            {/snippet}

            {@render chartBox(leftX, chartA_Y, "Signal A")}
            {@render chartBox(leftX, chartB_Y, "Signal B")}
            {@render chartBox(rightX, chartSum_Y, "Summed Signal (A + B)")}

            <!-- Continuous Signals -->
            <path d={linePoints1} fill="none" stroke="var(--color-signal-actual)" stroke-width="2" opacity="0.3" />
            <path d={linePoints2} fill="none" stroke="var(--color-signal-aliased)" stroke-width="2" opacity="0.3" />
            <path
                d={linePointsSum}
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="3"
                opacity={isAnimating ? "0.6" : "0.1"}
                class="transition-opacity {isAnimating ? 'duration-1000' : 'duration-0'}"
            />

            <!-- Samples -->
            {#each samples as s, i}
                {@const x1_start = leftX + s.t * CHART_WIDTH}
                {@const y1_center = chartA_Y + CHART_HEIGHT / 2}
                {@const y1_target = getY(s.v1, y1_center)}

                {@const x2_start = leftX + s.t * CHART_WIDTH}
                {@const y2_center = chartB_Y + CHART_HEIGHT / 2}
                {@const y2_target = getY(s.v2, y2_center)}

                {@const x_end = rightX + s.t * CHART_WIDTH}
                {@const y_sum_center = chartSum_Y + CHART_HEIGHT / 2}
                {@const y1_end = getY(s.v1, y_sum_center)}
                {@const y2_end = getY(s.v2, y1_end)}
                {@const y_result = getY(s.v1 + s.v2, y_sum_center)}

                <!-- Signal A vectors -->
                <g
                    class="transition-all {isAnimating ? 'duration-[600ms]' : 'duration-0'} ease-in-out"
                    style="transform: translate({isAnimating ? x_end - x1_start : 0}px, {isAnimating ? y_sum_center - y1_center : 0}px); transition-delay: {isAnimating ? i * 2.0 : 0}s"
                >
                    {#if Math.abs(s.v1) > 0.01}
                        {@render vector(x1_start, y1_center, y1_target, "var(--color-signal-actual)", 0.6)}
                    {:else}
                        <circle cx={x1_start} cy={y1_center} r="2.5" fill="var(--color-signal-actual)" opacity="0.6" />
                    {/if}
                </g>

                <!-- Signal B vectors -->
                <g
                    class="transition-all {isAnimating ? 'duration-[600ms]' : 'duration-0'} ease-in-out"
                    style="transform: translate({isAnimating ? x_end - x2_start : 0}px, {isAnimating ? y1_end - y2_center : 0}px); transition-delay: {isAnimating ? i * 2.0 + 1.0 : 0}s"
                >
                    {#if Math.abs(s.v2) > 0.01}
                        {@render vector(x2_start, y2_center, y2_target, "var(--color-signal-aliased)", 0.6)}
                    {:else}
                        <circle cx={x2_start} cy={y2_center} r="2.5" fill="var(--color-signal-aliased)" opacity="0.6" />
                    {/if}
                </g>

                <!-- Result point -->
                {#if isAnimating}
                    <circle
                        cx={x_end}
                        cy={y_result}
                        r="3"
                        fill="var(--color-primary)"
                        class="result-element"
                        style="animation-delay: {i * 2.0 + 1.8}s"
                    />
                {/if}
            {/each}
        </svg>
    </div>
</div>

<style>
    .fill-text-secondary {
        fill: var(--color-text-secondary);
    }

    .result-element {
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 0.8; }
    }
</style>
