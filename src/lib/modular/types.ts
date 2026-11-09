export interface XYPosition {
  x: number;
  y: number;
}

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

export interface ModuleNode {
  id: string;
  phase?: number;
  position?: XYPosition;
  data: ModuleNodeData;
}

export interface CableEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: CableEdgeData;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface HandlePositions {
  source: XYPosition;
  target: XYPosition;
}
