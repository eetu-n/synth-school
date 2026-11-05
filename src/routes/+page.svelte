<script lang="ts">
  import ModularRack from '$lib/components/modular/ModularRack.svelte';
  import type { ModuleNode, CableEdge } from '$lib/modular/types';
  import type { Connection, Edge } from '@xyflow/svelte';

  const nodes: ModuleNode[] = [
    {
      id: 'aliasing',
      position: { x: 50, y: 100 },
      data: { title: 'Aliasing', href: '/lessons/aliasing/1-intro' }
    },
    {
      id: 'oscillators',
      position: { x: 260, y: 100 },
      data: { title: 'Oscillators', href: '/lessons/oscillators/1-intro' }
    },
    {
      id: 'filters',
      position: { x: 470, y: 100 },
      data: { title: 'Filters', href: '/lessons/filters/1-intro' }
    },
    {
      id: 'envelopes',
      position: { x: 260, y: 220 },
      data: { title: 'Envelopes', href: '/lessons/envelopes/1-intro' }
    },
    {
      id: 'synthQuiz',
      position: { x: 470, y: 220 },
      data: { title: 'Synth Match', href: '/lessons/synthQuiz' }
    }
  ];

  const edges: CableEdge[] = [
    { id: 'e-alias-osc', source: 'aliasing', target: 'oscillators' },
    { id: 'e-osc-filters', source: 'oscillators', target: 'filters' },
    { id: 'e-env-filters', source: 'envelopes', target: 'filters' },
    { id: 'e-filters-quiz', source: 'filters', target: 'synthQuiz' }
  ];

  const allowedConnections = new Set([
    'aliasing->oscillators',
    'oscillators->filters',
    'envelopes->filters',
    'filters->synthQuiz',
    'envelopes->synthQuiz'
  ]);

  function isValidConnection(connection: Edge | Connection) {
    return allowedConnections.has(`${connection.source}->${connection.target}`);
  }
</script>

<svelte:head>
  <title>Synth School</title>
</svelte:head>

<div class="h-full w-full flex flex-col min-h-0">
  <ModularRack {nodes} {edges} {isValidConnection} />
</div>
