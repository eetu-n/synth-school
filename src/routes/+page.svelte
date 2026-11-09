<script lang="ts">
  import ModularRack from '$lib/components/modular/ModularRack.svelte';
  import { getCurriculumModuleNodes } from '$lib/curriculum/lessons';

  const nodes = getCurriculumModuleNodes();
</script>

<svelte:head>
  <title>Synth School</title>
</svelte:head>

<div class="h-full w-full flex flex-col min-h-0">
  <ModularRack {nodes} />
</div>
