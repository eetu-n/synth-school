import type { Node, Edge } from '@xyflow/svelte';

export interface ModuleNodeData extends Record<string, unknown> {
  title: string;
  href: string;
}

export interface CableEdgeData extends Record<string, unknown> {
  color?: string;
  slack?: number;
}

export type ModuleNode = Node<ModuleNodeData>;
export type CableEdge = Edge<CableEdgeData>;
