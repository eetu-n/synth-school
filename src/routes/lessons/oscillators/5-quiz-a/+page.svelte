<script lang="ts">
    import SignalCompareQuiz from "$lib/components/ui/layout/SignalCompareQuiz.svelte";

    const fa = (t: number) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? 1 : -1;
    const fb = (t: number) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? -1 : 1;
    
    const f0 = (t: number) => 0;
    const f1 = (t: number) => Math.sin(2 * Math.PI * 2 * t);
    const f2 = (t: number) => Math.sin(2 * Math.PI * 2 * t) >= 0 ? -1 : 1;
    const f3 = (t: number) => (Math.sin(2 * Math.PI * 2 * t) >= 0 ? -0.5 : 0.5) + (Math.sin(4 * Math.PI * 2 * t) >= 0 ? 0.5 : -0.5);
</script>

<SignalCompareQuiz 
    {fa} 
    {fb} 
    {f0}
    {f1}
    {f2}
    {f3}
/>
