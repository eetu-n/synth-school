import type { Node, Edge, XYPosition } from '@xyflow/svelte';

export interface ModuleNodeData extends Record<string, unknown> {
  title: string;
  href: string;
  phase?: number;
  allowedTargets?: string[];
  isMobile?: boolean;
}

export interface CableEdgeData extends Record<string, unknown> {
  color?: string;
  slack?: number;
}

export type ModuleNode = Omit<Node<ModuleNodeData>, 'position'> & {
  position?: XYPosition;
  phase?: number;
};
export type CableEdge = Edge<CableEdgeData>;
