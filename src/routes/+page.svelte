<script lang="ts">
  import ModularRack from '$lib/components/modular/ModularRack.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';

  const nodes: ModuleNode[] = [
    {
      id: 'aliasing',
      phase: 1,
      data: {
        title: 'Aliasing',
        href: '/lessons/aliasing/1-intro'
      }
    },
    {
      id: 'oscillators',
      phase: 2,
      data: {
        title: 'Oscillators',
        href: '/lessons/oscillators/1-intro'
      }
    },
    {
      id: 'filters',
      phase: 3,
      data: {
        title: 'Filters',
        href: '/lessons/filters/1-intro'
      }
    },
    {
      id: 'envelopes',
      phase: 4,
      data: {
        title: 'Envelopes',
        href: '/lessons/envelopes/1-intro'
      }
    },
    {
      id: 'synthQuiz',
      phase: 5,
      data: {
        title: 'Synth Match',
        href: '/lessons/synthQuiz'
      }
    }
  ];

  const edges: CableEdge[] = [
    { id: 'e-alias-osc', source: 'aliasing', target: 'oscillators' },
    { id: 'e-osc-filters', source: 'oscillators', target: 'filters' },
    { id: 'e-filters-env', source: 'filters', target: 'envelopes' },
    { id: 'e-env-quiz', source: 'envelopes', target: 'synthQuiz' }
  ];
</script>

<svelte:head>
  <title>Synth School</title>
</svelte:head>

<div class="h-full w-full flex flex-col min-h-0">
  <ModularRack {nodes} {edges} />
</div>
