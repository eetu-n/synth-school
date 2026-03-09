<script lang="ts">
    import FaustSawSelector from '$lib/audioComponents/FaustSawSelector.svelte';
    import { audioState } from '$lib/audioFramework/audioState.svelte';
</script>

<div style="margin-top: 1rem; display: flex;
  justify-content: center;
  align-items: center;">
    <FaustSawSelector output={audioState.masterWorklet} />
</div>