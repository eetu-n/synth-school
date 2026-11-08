<script lang="ts">
  import ModularRack from '$lib/components/modular/ModularRack.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';

  const nodes: ModuleNode[] = [
    {
      id: 'oscillators',
      phase: 1,
      data: {
        title: 'Oscillators',
        href: '/lessons/oscillators/1-intro'
      }
    },
    {
      id: 'filters',
      phase: 2,
      data: {
        title: 'Filters',
        href: '/lessons/filters/1-intro'
      }
    },
    {
      id: 'envelopes',
      phase: 3,
      data: {
        title: 'Envelopes',
        href: '/lessons/envelopes/1-intro'
      }
    },
    {
      id: 'synthQuiz',
      phase: 4,
      data: {
        title: 'Synth Match',
        href: '/lessons/synthQuiz'
      }
    }
  ];
</script>

<svelte:head>
  <title>Synth School</title>
</svelte:head>

<div class="h-full w-full flex flex-col min-h-0">
  <ModularRack {nodes} />
</div>
