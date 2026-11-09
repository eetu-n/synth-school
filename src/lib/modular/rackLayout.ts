import type { ModuleNode, XYPosition } from './types';
import {
  DESKTOP_START_X,
  DESKTOP_PHASE_SPACING,
  DESKTOP_SIBLING_SPACING,
  MOBILE_PHASE_SPACING,
  MOBILE_SIBLING_SPACING,
  CARD_CENTER_Y_OFFSET,
  MOBILE_HANDLE_OFFSET_X,
  DESKTOP_CARD_MIN_WIDTH
} from './constants';

export interface RackLayoutResult {
  layoutedNodes: ModuleNode[];
  rackWidth: number;
  rackHeight: number;
}

export function computeRackLayout(
  nodes: ModuleNode[],
  containerWidth: number,
  containerHeight: number,
  isMobile: boolean
): RackLayoutResult {
  const nodesByPhase = new Map<number, ModuleNode[]>();
  for (const node of nodes) {
    const p = node.phase ?? node.data?.phase ?? 1;
    const list = nodesByPhase.get(p) ?? [];
    list.push(node);
    nodesByPhase.set(p, list);
  }

  const sortedPhases = Array.from(nodesByPhase.keys()).sort((a, b) => a - b);
  const numPhases = sortedPhases.length;
  const height = containerHeight > 0 ? containerHeight : 500;
  const centerY = height / 2 - CARD_CENTER_Y_OFFSET;

  const layoutedNodes: ModuleNode[] = nodes.map((node) => {
    if (node.position) {
      return {
        ...node,
        data: {
          ...node.data,
          isMobile
        }
      };
    }

    const p = node.phase ?? node.data?.phase ?? 1;
    const phaseIndex = sortedPhases.indexOf(p);
    const siblings = nodesByPhase.get(p) ?? [node];
    const nodeIndex = siblings.indexOf(node);
    const count = siblings.length;

    let x: number;
    let y: number;

    if (isMobile) {
      // Bottom-up: Phase 1 at bottom, higher phases stacked above
      const invertedPhaseIndex = numPhases - 1 - phaseIndex;
      const baseX = Math.max(55, (containerWidth - MOBILE_SIBLING_SPACING) / 2);
      x = baseX + (nodeIndex - (count - 1) / 2) * MOBILE_SIBLING_SPACING;
      y = 70 + invertedPhaseIndex * MOBILE_PHASE_SPACING;
    } else {
      x = DESKTOP_START_X + phaseIndex * DESKTOP_PHASE_SPACING;
      y = centerY + (nodeIndex - (count - 1) / 2) * DESKTOP_SIBLING_SPACING;
    }

    return {
      ...node,
      position: { x, y },
      data: {
        ...node.data,
        isMobile
      }
    };
  });

  let rackWidth: number;
  let rackHeight: number;

  if (isMobile) {
    rackWidth = containerWidth;
    let maxY = 0;
    for (const node of layoutedNodes) {
      if (node.position && node.position.y > maxY) {
        maxY = node.position.y;
      }
    }
    rackHeight = Math.max(containerHeight, maxY + MOBILE_PHASE_SPACING);
  } else {
    let maxX = 0;
    for (const node of layoutedNodes) {
      if (node.position && node.position.x > maxX) {
        maxX = node.position.x;
      }
    }
    rackWidth = Math.max(containerWidth, maxX + 650);
    rackHeight = Math.max(containerHeight, 500);
  }

  return { layoutedNodes, rackWidth, rackHeight };
}

export function getFallbackSourceHandle(
  node: ModuleNode | undefined,
  isMobile: boolean
): XYPosition {
  const posX = node?.position?.x ?? 0;
  const posY = node?.position?.y ?? 0;
  if (isMobile) {
    return { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY };
  }
  return { x: posX + DESKTOP_CARD_MIN_WIDTH, y: posY + CARD_CENTER_Y_OFFSET };
}

export function getFallbackTargetHandle(
  node: ModuleNode | undefined,
  isMobile: boolean
): XYPosition {
  const posX = node?.position?.x ?? 0;
  const posY = node?.position?.y ?? 0;
  if (isMobile) {
    return { x: posX + MOBILE_HANDLE_OFFSET_X, y: posY + 110 };
  }
  return { x: posX, y: posY + CARD_CENTER_Y_OFFSET };
}
