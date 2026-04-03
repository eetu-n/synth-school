<script lang="ts">
    import { SvelteFlow, Background, Controls, Position } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/style.css';
    import type RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';

    const nodeDefaults = {
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    };

    let { startNode }: { startNode: RoutedAudioNode | null } = $props();

    let graphData = $state.raw<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });

    function getGraph(startNode: RoutedAudioNode | null) {
        if (!startNode) return { nodes: [], edges: [] };

        const visited = new Set<RoutedAudioNode>();
        const toVisit = [startNode];
        const rawNodes: RoutedAudioNode[] = [];
        
        while (toVisit.length > 0) {
            const node = toVisit.pop();
            if (!node || visited.has(node)) continue;

            visited.add(node);
            rawNodes.push(node);
            
            for (const input of node.getInputs()) {
                if (!visited.has(input)) {
                    toVisit.push(input);
                }
            }
            for (const output of node.getOutputs()) {
                if (!visited.has(output)) {
                    toVisit.push(output);
                }
            }
        }

        const nodes: any[] = [];
        const edges: any[] = [];
        const nodeToId = new Map<RoutedAudioNode, string>();

        const nodeDepths = new Map<RoutedAudioNode, number>();
        let roots = rawNodes.filter(n => n.getInputs().length === 0);
        if (roots.length === 0 && rawNodes.length > 0) roots = [rawNodes[0]];
        
        roots.forEach(n => nodeDepths.set(n, 0));
        let queue = [...roots];
        let iterations = 0;
        while (queue.length > 0 && iterations < 1000) {
            iterations++;
            const current = queue.shift()!;
            const currentDepth = nodeDepths.get(current)!;
            for (const output of current.getOutputs()) {
                if (!nodeDepths.has(output) || nodeDepths.get(output)! < currentDepth + 1) {
                    nodeDepths.set(output, currentDepth + 1);
                    queue.push(output);
                }
            }
        }

        const depthCounts = new Map<number, number>();

        rawNodes.forEach((node, index) => {
            const id = `node-${index}`;
            nodeToId.set(node, id);
            
            const depth = nodeDepths.get(node) ?? 0;
            const yIndex = depthCounts.get(depth) ?? 0;
            depthCounts.set(depth, yIndex + 1);

            nodes.push({
                id,
                position: { x: depth * 250, y: yIndex * 100 },
                data: { label: node.name },
                ...nodeDefaults
            });
        });

        nodes.forEach(n => {
            const nodeObj = rawNodes[parseInt(n.id.split('-')[1])];
            const depth = nodeDepths.get(nodeObj) ?? 0;
            const totalInDepth = depthCounts.get(depth) ?? 1;
            n.position.y -= (totalInDepth - 1) * 100 / 2;
        });

        rawNodes.forEach(node => {
            const sourceId = nodeToId.get(node);
            node.getOutputs().forEach(output => {
                const targetId = nodeToId.get(output);
                if (sourceId && targetId) {
                    edges.push({
                        id: `e-${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId
                    });
                }
            });
        });

        return { nodes, edges };
    }

    $effect(() => {
        graphData = getGraph(startNode);
    });
</script>

<div style="height: 450px; width: 100%;">
    {#key graphData}
    <SvelteFlow nodes={graphData.nodes} edges={graphData.edges} fitView proOptions={{ hideAttribution: true }}>
        <Background />
    </SvelteFlow>
    {/key}
</div>