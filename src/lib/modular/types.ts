export interface XYPosition {
  x: number;
  y: number;
}

export interface ModuleNodeData {
  title: string;
  href: string;
  allowedTargets?: string[];
}

export interface CableEdgeData {
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
  data?: CableEdgeData;
}

export interface Connection {
  source: string;
  target: string;
}

export interface HandlePositions {
  source: XYPosition;
  target: XYPosition;
}
