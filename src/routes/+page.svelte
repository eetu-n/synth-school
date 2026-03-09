<script lang="ts">
	import FaustSawSelector from '$lib/audioComponents/FaustSawSelector.svelte';
	import { audioState } from '$lib/audioFramework/audioState.svelte';
</script>

<FaustSawSelector output={audioState.masterWorklet} />
