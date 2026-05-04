<script lang="ts">
    import MultipleChoice from "$lib/components/ui/layout/MultipleChoice.svelte";
    import Chart from "$lib/components/ui/viz/Chart.svelte";
</script>

<MultipleChoice
    {question}
    options={[
        { id: 1, content: a1, isCorrect: true },
        { id: 2, content: a2 },
        { id: 3, content: a3 },
        { id: 4, content: a4 }
    ]}
    prev="/lessons/oscillators/4"
    next="/lessons/aliasing/1"
/>

{#snippet question()}
    <p>Which one of these signals is created by summing signals A and B?</p>
    
    <div class="grid grid-cols-1 gap-2">
        <div class="scale-75 -my-12">
            <Chart 
                signal={(t) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? 1 : -1} 
                label="Signal A" 
                showAxisLabels={true}
                showLabels={true}
                duration={1}
            />
        </div>
        <div class="scale-75 -my-12">
            <Chart 
                signal={(t) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? -1 : 1} 
                label="Signal B" 
                showAxisLabels={true}
                showLabels={true}
                duration={1}
                color="#3b82f6"
            />
        </div>
    </div>
{/snippet}

{#snippet a1()}
<div class="w-full scale-75 -my-8">
    <Chart 
        signal={(t) => 0} 
        showAxisLabels={true}
        showLabels={false}
        duration={1}
    />
</div>
{/snippet}

{#snippet a2()}
<div class="w-full scale-75 -my-8">
    <Chart 
        signal={(t) => Math.sin(2 * Math.PI * 2 * t)} 
        showAxisLabels={true}
        showLabels={false}
        duration={1}
    />
</div>
{/snippet}

{#snippet a3()}
<div class="w-full scale-75 -my-8">
    <Chart 
        signal={(t) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? -1 : 1} 
        showAxisLabels={true}
        showLabels={false}
        duration={1}
    />
</div>
{/snippet}

{#snippet a4()}
<div class="w-full scale-75 -my-8">
    <Chart 
        signal={(t) => (Math.sin(2 * Math.PI * 2 * t) >= 0 ? -0.5 : 0.5) + (Math.sin(4 * Math.PI * 2 * t) >= 0 ? 0.5 : -0.5) } 
        showAxisLabels={true}
        showLabels={false}
        duration={1}
    />
</div>
{/snippet}

