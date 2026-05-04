<script lang="ts">
    import SignalCompareQuiz from "$lib/components/ui/layout/SignalCompareQuiz.svelte";

    const fa = (t: number) => Math.abs(2 * (t * 2 - Math.floor(t * 2 + 0.5))) - 0.5;
    const fb = (t: number) => Math.cos(2 * Math.PI * 2 * t) >= 0 ? -0.5 : 0.5;
    
    const f0 = (t: number) => fa(t) + fb(t);
    const f1 = (t: number) => fa(t) - fb(t);
    const f2 = (t: number) => (fa(t) + fb(t)) * 0.5;
    const f3 = (t: number) => 0;
</script>

<SignalCompareQuiz 
    {fa} 
    {fb} 
    {f0}
    {f1}
    {f2}
    {f3}
    prev="/lessons/oscillators/5/b"
    next="/lessons/aliasing/1"
/>
