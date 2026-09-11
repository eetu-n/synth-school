<script lang="ts">
    import SignalCompareQuiz from "$lib/components/ui/layout/SignalCompareQuiz.svelte";

    const fa = (t: number) => Math.sin(2 * Math.PI * 2 * t);
    const fb = (t: number) => Math.sin(2 * Math.PI * 2 * t) * -1;
    
    const f0 = (t: number) => 0;
    const f1 = (t: number) => fa(t) * 0.5;
    const f2 = (t: number) => Math.cos(4 * Math.PI * t);
    const f3 = (t: number) => 2 * Math.abs(2 * (t * 2 - Math.floor(t * 2 + 0.5))) - 1;
</script>

<SignalCompareQuiz 
    {fa} 
    {fb} 
    {f0}
    {f1}
    {f2}
    {f3}
/>
