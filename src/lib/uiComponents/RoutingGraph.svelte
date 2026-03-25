<script lang="ts">
    import type RoutedAudioNode from '$lib/audioFramework/RoutedAudioNode';
    import { onMount, afterUpdate } from 'svelte';

    export let startNode: RoutedAudioNode | null = null;

    let canvas: HTMLCanvasElement;

    function getNodes(startNode: RoutedAudioNode | null): RoutedAudioNode[] {
        if (!startNode) return [];

        const visited = new Set<RoutedAudioNode>();
        const toVisit = [startNode];
        const nodes: RoutedAudioNode[] = [];
        
        while (toVisit.length > 0) {
            const node = toVisit.pop();
            if (!node || visited.has(node)) continue;

            visited.add(node);
            nodes.push(node);
            
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
        return nodes;
    }

    function getTopologicalSort(nodes: RoutedAudioNode[]) {
        const inDegree = new Map<RoutedAudioNode, number>();
        const queue: RoutedAudioNode[] = [];
        const sorted: RoutedAudioNode[] = [];

        for (const node of nodes) {
            const degree = node.getInputs().filter(n => nodes.includes(n)).length;
            inDegree.set(node, degree);
            if (degree === 0) {
                queue.push(node);
            }
        }


        while (queue.length > 0) {
            const node = queue.shift()!;
            sorted.push(node);

            for (const output of node.getOutputs()) {
                if (!nodes.includes(output)) continue;
                const newInDegree = (inDegree.get(output) ?? 0) - 1;
                inDegree.set(output, newInDegree);
                if (newInDegree === 0) {
                    queue.push(output);
                }
            }
        }

        if (sorted.length !== nodes.length) {
            console.error("Cycle detected in graph, or graph is not fully connected.");
            return null; 
        }

        return sorted;
    }

    function getNodePositions(startNode: RoutedAudioNode | null, canvasWidth: number, canvasHeight: number) {
        if (!startNode) return new Map();

        const allNodes = getNodes(startNode);
        const sortedNodes = getTopologicalSort(allNodes);

        if(!sortedNodes) {
            // Fallback for cyclic graphs
            return new Map();
        }
        
        const depths = new Map<RoutedAudioNode, number>();
        for(const node of sortedNodes) {
            let maxParentDepth = -1;
            for(const input of node.getInputs()) {
                if (!allNodes.includes(input)) continue;
                maxParentDepth = Math.max(maxParentDepth, depths.get(input) ?? -1);
            }
            depths.set(node, maxParentDepth + 1);
        }


        const positions = new Map<RoutedAudioNode, { x: number, y: number }>();
        const nodesAtDepth = new Map<number, RoutedAudioNode[]>();

        for(const node of sortedNodes) {
            const depth = depths.get(node)!;
            if(!nodesAtDepth.has(depth)) {
                nodesAtDepth.set(depth, []);
            }
            nodesAtDepth.get(depth)!.push(node);
        }
        

        const xOffset = 150;
        const yOffset = 100;
        for(const [depth, nodes] of nodesAtDepth.entries()) {
            const totalHeight = (nodes.length - 1) * yOffset;
            let startY = (canvasHeight - totalHeight) / 2;
            for(let i=0; i<nodes.length; i++) {
                const node = nodes[i];
                positions.set(node, { x: 50 + depth * xOffset, y: startY + i * yOffset});
            }
        }

        return positions;
    }

    function getIntersectionPoint(
        rectCenter: { x: number; y: number },
        otherPoint: { x: number; y: number },
        rectSize: { width: number; height: number }
    ) {
        const w = rectSize.width;
        const h = rectSize.height;
        const dx = otherPoint.x - rectCenter.x;
        const dy = otherPoint.y - rectCenter.y;

        if (dx === 0 && dy === 0) {
            return rectCenter;
        }

        // Check for vertical line
        if (dx === 0) {
            return { x: rectCenter.x, y: rectCenter.y + (Math.sign(dy) * h) / 2 };
        }
        // Check for horizontal line
        if (dy === 0) {
            return { x: rectCenter.x + (Math.sign(dx) * w) / 2, y: rectCenter.y };
        }

        const slope = dy / dx;
        const rectAspect = h / w;

        if (Math.abs(slope) < rectAspect) {
            // Intersects with left or right side
            const x = rectCenter.x + (Math.sign(dx) * w) / 2;
            const y = rectCenter.y + slope * (x - rectCenter.x);
            return { x, y };
        } else {
            // Intersects with top or bottom side
            const y = rectCenter.y + (Math.sign(dy) * h) / 2;
            const x = rectCenter.x + (y - rectCenter.y) / slope;
            return { x, y };
        }
    }

    function draw() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const nodePositions = getNodePositions(startNode, canvas.width, canvas.height);
        const nodes = Array.from(nodePositions.keys());

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const nodeRectSize = { width: 100, height: 50 };

        // Draw connections
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        for (const node of nodes) {
            const startPos = nodePositions.get(node);
            if (!startPos) continue;

            for (const output of node.outputs) {
                const endPos = nodePositions.get(output);
                if (!endPos) continue;

                const lineStart = getIntersectionPoint(startPos, endPos, nodeRectSize);
                const lineEnd = getIntersectionPoint(endPos, startPos, nodeRectSize);

                ctx.beginPath();
                ctx.moveTo(lineStart.x, lineStart.y);
                ctx.lineTo(lineEnd.x, lineEnd.y);
                ctx.stroke();

                // Draw arrowhead
                const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
                ctx.save();
                ctx.translate(lineEnd.x, lineEnd.y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(0, 0);
                ctx.lineTo(-10, 5);
                ctx.stroke();
                ctx.restore();
            }
        }
        // Draw nodes
        for (const node of nodes) {
            const pos = nodePositions.get(node);
            if (!pos) continue;

            ctx.fillStyle = 'lightblue';
            ctx.fillRect(
                pos.x - nodeRectSize.width / 2,
                pos.y - nodeRectSize.height / 2,
                nodeRectSize.width,
                nodeRectSize.height
            );
            ctx.fillStyle = 'black';
            ctx.fillText(node.name, pos.x, pos.y);
        }
    }

    onMount(() => {
        draw();
    });

    afterUpdate(() => {
        draw();
    });
</script>

<canvas bind:this={canvas} width="800" height="600" style="border: 1px solid black;"></canvas>