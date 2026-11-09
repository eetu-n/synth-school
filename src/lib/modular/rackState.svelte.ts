import type {
  ModuleNode,
  CableEdge,
  Connection,
  HandlePositions,
  XYPosition
} from './types';
import { CONNECTION_SNAP_RADIUS } from './constants';
import { getFallbackSourceHandle, getFallbackTargetHandle } from './rackLayout';

export interface DragState {
  type: 'new' | 'reconnect';
  sourceId: string;
  from: XYPosition;
  to: XYPosition;
  hoveredTargetId: string | null;
  targetPos: XYPosition | null;
  edgeId?: string;
  scrub?: number;
}

export class ModularRackState {
  panX = $state(0);
  panY = $state(0);
  isPanning = $state(false);
  activeDrag = $state<DragState | null>(null);

  private panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private handlePositions = $state<Record<string, HandlePositions>>({});
  private snapAnimId: number | null = null;
  private initialMobileSet = false;

  destroy() {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
  }

  updateHandles(id: string, handles: HandlePositions) {
    this.handlePositions[id] = handles;
  }

  getSourceHandle(nodeId: string, layoutedNodes: ModuleNode[], isMobile: boolean): XYPosition {
    if (this.handlePositions[nodeId]?.source) {
      return this.handlePositions[nodeId].source;
    }
    const node = layoutedNodes.find((n) => n.id === nodeId);
    return getFallbackSourceHandle(node, isMobile);
  }

  getTargetHandle(nodeId: string, layoutedNodes: ModuleNode[], isMobile: boolean): XYPosition {
    if (this.handlePositions[nodeId]?.target) {
      return this.handlePositions[nodeId].target;
    }
    const node = layoutedNodes.find((n) => n.id === nodeId);
    return getFallbackTargetHandle(node, isMobile);
  }

  clampPan(
    isMobile: boolean,
    rackWidth: number,
    rackHeight: number,
    containerWidth: number,
    containerHeight: number
  ) {
    if (!isMobile) {
      const maxScrollX = Math.max(0, rackWidth - containerWidth);
      this.panX = Math.min(0, Math.max(-maxScrollX, this.panX));
      this.panY = 0;
    } else {
      const maxScrollY = Math.max(0, rackHeight - containerHeight);
      this.panY = Math.min(0, Math.max(-maxScrollY, this.panY));
      this.panX = 0;
    }
  }

  initMobileScroll(isMobile: boolean, containerHeight: number, layoutedNodes: ModuleNode[]) {
    if (isMobile && containerHeight > 0 && !this.initialMobileSet) {
      let maxY = 0;
      for (const node of layoutedNodes) {
        if (node.position && node.position.y > maxY) {
          maxY = node.position.y;
        }
      }
      this.panY = Math.min(0, -(maxY - containerHeight + 150));
      this.initialMobileSet = true;
    }
  }

  validateConnection(
    sourceId: string,
    targetId: string,
    nodes: ModuleNode[],
    customIsValidConnection?: (connection: Connection) => boolean
  ): boolean {
    if (customIsValidConnection) {
      return customIsValidConnection({ source: sourceId, target: targetId });
    }
    if (!sourceId || !targetId) return false;
    if (sourceId === targetId) return false;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return false;

    if (sourceNode.data?.allowedTargets !== undefined) {
      return sourceNode.data.allowedTargets.includes(targetId);
    }

    const sourcePhase = sourceNode.phase ?? sourceNode.data?.phase ?? 1;
    const targetPhase = targetNode.phase ?? targetNode.data?.phase ?? 1;

    const sortedPhases = Array.from(
      new Set(nodes.map((n) => n.phase ?? n.data?.phase ?? 1))
    ).sort((a, b) => a - b);
    const sourceIndex = sortedPhases.indexOf(sourcePhase);
    const targetIndex = sortedPhases.indexOf(targetPhase);

    return (
      targetPhase === sourcePhase + 1 ||
      (sourceIndex !== -1 && targetIndex === sourceIndex + 1)
    );
  }

  startDrag(
    sourceId: string,
    event: PointerEvent,
    containerEl: HTMLElement | null,
    layoutedNodes: ModuleNode[],
    isMobile: boolean
  ) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const from = this.getSourceHandle(sourceId, layoutedNodes, isMobile);
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const to = {
      x: event.clientX - rect.left - this.panX,
      y: event.clientY - rect.top - this.panY
    };

    this.activeDrag = {
      type: 'new',
      sourceId,
      from,
      to,
      hoveredTargetId: null,
      targetPos: null,
      scrub: 0
    };
  }

  startReconnect(
    edgeId: string,
    edges: CableEdge[],
    event: PointerEvent,
    containerEl: HTMLElement | null,
    layoutedNodes: ModuleNode[],
    isMobile: boolean
  ) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const edge = edges.find((e) => e.id === edgeId);
    if (!edge || !containerEl) return;

    const from = this.getSourceHandle(edge.source, layoutedNodes, isMobile);
    const rect = containerEl.getBoundingClientRect();
    const to = {
      x: event.clientX - rect.left - this.panX,
      y: event.clientY - rect.top - this.panY
    };

    const targetPos = this.getTargetHandle(edge.target, layoutedNodes, isMobile);
    const dist = Math.hypot(to.x - targetPos.x, to.y - targetPos.y);
    const scrub = Math.max(0, Math.min(1, 1 - dist / CONNECTION_SNAP_RADIUS));

    this.activeDrag = {
      type: 'reconnect',
      edgeId,
      sourceId: edge.source,
      from,
      to,
      hoveredTargetId: edge.target,
      targetPos,
      scrub
    };
  }

  handlePointerMove(
    event: PointerEvent,
    containerEl: HTMLElement | null,
    layoutedNodes: ModuleNode[],
    isMobile: boolean,
    rackWidth: number,
    rackHeight: number,
    containerWidth: number,
    containerHeight: number,
    nodes: ModuleNode[],
    customIsValidConnection?: (c: Connection) => boolean
  ) {
    if (!containerEl || this.snapAnimId !== null) return;

    if (this.activeDrag) {
      const rect = containerEl.getBoundingClientRect();
      const worldX = event.clientX - rect.left - this.panX;
      const worldY = event.clientY - rect.top - this.panY;

      let matchedTargetId: string | null = null;
      let targetPos: XYPosition | null = null;
      let minDistance = Infinity;

      for (const node of layoutedNodes) {
        if (node.id === this.activeDrag.sourceId) continue;
        const candidatePos = this.getTargetHandle(node.id, layoutedNodes, isMobile);
        const dist = Math.hypot(worldX - candidatePos.x, worldY - candidatePos.y);

        if (
          dist <= CONNECTION_SNAP_RADIUS &&
          this.validateConnection(this.activeDrag.sourceId, node.id, nodes, customIsValidConnection)
        ) {
          if (dist < minDistance) {
            minDistance = dist;
            matchedTargetId = node.id;
            targetPos = candidatePos;
          }
        }
      }

      if (matchedTargetId && targetPos) {
        const scrub = Math.max(0, Math.min(1, 1 - minDistance / CONNECTION_SNAP_RADIUS));
        this.activeDrag.to = {
          x: worldX + (targetPos.x - worldX) * scrub,
          y: worldY + (targetPos.y - worldY) * scrub
        };
        this.activeDrag.hoveredTargetId = matchedTargetId;
        this.activeDrag.targetPos = targetPos;
        this.activeDrag.scrub = scrub;
      } else {
        this.activeDrag.to = { x: worldX, y: worldY };
        this.activeDrag.hoveredTargetId = null;
        this.activeDrag.targetPos = null;
        this.activeDrag.scrub = 0;
      }
    } else if (this.isPanning) {
      if (!isMobile) {
        const dx = event.clientX - this.panStart.x;
        const maxScrollX = Math.max(0, rackWidth - containerWidth);
        this.panX = Math.min(0, Math.max(-maxScrollX, this.panStart.panX + dx));
      } else {
        const dy = event.clientY - this.panStart.y;
        const maxScrollY = Math.max(0, rackHeight - containerHeight);
        this.panY = Math.min(0, Math.max(-maxScrollY, this.panStart.panY + dy));
      }
    }
  }

  handlePointerUp(
    edges: CableEdge[],
    onEdgesChange: (edges: CableEdge[]) => void
  ) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }

    if (this.activeDrag) {
      const currentDrag = this.activeDrag;
      const targetPos = currentDrag.targetPos;
      const targetId = currentDrag.hoveredTargetId;
      const sourceId = currentDrag.sourceId;
      const edgeId = currentDrag.edgeId;
      const dragType = currentDrag.type;
      const startScrub = currentDrag.scrub ?? 0;
      const startTo = { ...currentDrag.to };

      const commitConnection = () => {
        if (dragType === 'new' && targetId) {
          const newEdge: CableEdge = {
            id: `cable-${sourceId}-${targetId}-${Date.now()}`,
            source: sourceId,
            target: targetId
          };
          onEdgesChange([...edges.filter((e) => e.source !== sourceId), newEdge]);
        } else if (dragType === 'reconnect' && edgeId && targetId) {
          onEdgesChange(
            edges.map((e) => (e.id === edgeId ? { ...e, target: targetId } : e))
          );
        }
        this.activeDrag = null;
      };

      if (targetId && targetPos) {
        if (startScrub >= 0.98) {
          commitConnection();
        } else {
          const duration = Math.min(180, Math.max(90, (1 - startScrub) * 180));
          const startTime = performance.now();

          const animateSnap = () => {
            const now = performance.now();
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            const ease = 1 - Math.pow(1 - progress, 3);

            if (this.activeDrag) {
              this.activeDrag.scrub = startScrub + (1 - startScrub) * ease;
              this.activeDrag.to = {
                x: startTo.x + (targetPos.x - startTo.x) * ease,
                y: startTo.y + (targetPos.y - startTo.y) * ease
              };
            }

            if (progress < 1) {
              this.snapAnimId = requestAnimationFrame(animateSnap);
            } else {
              commitConnection();
              this.snapAnimId = null;
            }
          };

          this.snapAnimId = requestAnimationFrame(animateSnap);
        }
      } else if (dragType === 'reconnect' && edgeId) {
        onEdgesChange(edges.filter((e) => e.id !== edgeId));
        this.activeDrag = null;
      } else {
        this.activeDrag = null;
      }
    }

    if (this.isPanning) {
      this.isPanning = false;
    }
  }

  handleContainerPointerDown(event: PointerEvent) {
    if (this.activeDrag) return;
    const target = event.target as HTMLElement | SVGElement | null;
    if (
      target &&
      (target.classList.contains('modular-rack') ||
        target.tagName === 'svg' ||
        target.tagName === 'rect')
    ) {
      this.isPanning = true;
      this.panStart = {
        x: event.clientX,
        y: event.clientY,
        panX: this.panX,
        panY: this.panY
      };
    }
  }

  handleWheel(
    event: WheelEvent,
    isMobile: boolean,
    rackWidth: number,
    rackHeight: number,
    containerWidth: number,
    containerHeight: number
  ) {
    if (!isMobile) {
      const delta =
        event.deltaMode === 1
          ? event.deltaY * 20
          : Math.abs(event.deltaY) > Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;

      const maxScrollX = Math.max(0, rackWidth - containerWidth);
      this.panX = Math.min(0, Math.max(-maxScrollX, this.panX - delta));
      event.preventDefault();
    } else {
      const delta = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
      const maxScrollY = Math.max(0, rackHeight - containerHeight);
      this.panY = Math.min(0, Math.max(-maxScrollY, this.panY - delta));
      event.preventDefault();
    }
  }
}
