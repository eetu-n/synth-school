<script lang="ts">
    import MultipleChoice from "$lib/components/ui/layout/MultipleChoice.svelte";
    import Chart from "$lib/components/ui/viz/Chart.svelte";

    interface Props {
        fa: (t: number) => number;
        fb: (t: number) => number;
        f0: (t: number) => number;
        f1: (t: number) => number;
        f2: (t: number) => number;
        f3: (t: number) => number;
        prev?: string | null;
        next?: string | null;
    }

    let { fa, fb, f0, f1, f2, f3, prev, next }: Props = $props();

    const snippets = [s0, s1, s2, s3];
    const options = $derived([f0, f1, f2, f3]);

    let mcOptions = $derived(options.map((f, i) => ({
        id: i,
        content: snippets[i],
        isCorrect: i === 0 
    })));

</script>

<MultipleChoice
    {question}
    options={mcOptions}
    {prev}
    {next}
/>

{#snippet question()}
    <p>Which one of these signals is created by summing signals A and B?</p>
    
    <div class="grid grid-cols-1 gap-2">
        <div class="scale-75 -my-12">
            <Chart 
                signal={fa} 
                label="Signal A" 
                showAxisLabels={true}
                showLabels={true}
                duration={1}
            />
        </div>
        <div class="scale-75 -my-12">
            <Chart 
                signal={fb} 
                label="Signal B" 
                showAxisLabels={true}
                showLabels={true}
                duration={1}
                color="#3b82f6"
            />
        </div>
    </div>
{/snippet}

{#snippet s0()}
<div class="w-full scale-75 -my-8">
    <Chart signal={f0} showAxisLabels={true} showLabels={false} duration={1} />
</div>
{/snippet}

{#snippet s1()}
<div class="w-full scale-75 -my-8">
    <Chart signal={f1} showAxisLabels={true} showLabels={false} duration={1} />
</div>
{/snippet}

{#snippet s2()}
<div class="w-full scale-75 -my-8">
    <Chart signal={f2} showAxisLabels={true} showLabels={false} duration={1} />
</div>
{/snippet}

{#snippet s3()}
<div class="w-full scale-75 -my-8">
    <Chart signal={f3} showAxisLabels={true} showLabels={false} duration={1} />
</div>
{/snippet}
