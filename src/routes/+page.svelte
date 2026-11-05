<script lang="ts">
  import ModularRack from '$lib/components/modular/ModularRack.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';

  const nodes: ModuleNode[] = [
    {
      id: 'oscillators',
      position: { x: 0, y: 0 },
      data: {
        title: 'Oscillators',
        href: '/lessons/oscillators/1-intro',
        allowedTargets: ['filters']
      }
    },
    {
      id: 'filters',
      position: { x: 250, y: 0 },
      data: {
        title: 'Filters',
        href: '/lessons/filters/1-intro',
        allowedTargets: ['envelopes']
      }
    },
    {
      id: 'envelopes',
      position: { x: 500, y: 0 },
      data: {
        title: 'Envelopes',
        href: '/lessons/envelopes/1-intro',
        allowedTargets: []
      }
    }
  ];

  const edges: CableEdge[] = [
    { id: 'e-alias-osc', source: 'aliasing', target: 'oscillators' },
    { id: 'e-osc-filters', source: 'oscillators', target: 'filters' },
    { id: 'e-env-filters', source: 'envelopes', target: 'filters' },
    { id: 'e-filters-quiz', source: 'filters', target: 'synthQuiz' }
  ];
</script>

<svelte:head>
  <title>Synth School</title>
</svelte:head>

<div class="h-full w-full flex flex-col min-h-0">
  <ModularRack {nodes} />
</div>
