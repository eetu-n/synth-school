import { untrack } from 'svelte';
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

export interface RackContext {
  containerEl: HTMLElement | null;
  containerWidth: number;
  containerHeight: number;
  rackWidth: number;
  rackHeight: number;
  isMobile: boolean;
  nodes: ModuleNode[];
  layoutedNodes: ModuleNode[];
  isValidConnection?: (connection: Connection) => boolean;
}

export class ModularRackState {
  panX = $state(0);
  panY = $state(0);
  isPanning = $state(false);
  activeDrag = $state<DragState | null>(null);

  private panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private handlePositions = $state<Record<string, HandlePositions>>({});
  private snapAnimId: number | null = null;
  /**
   * Tracks whether the initial mobile scroll offset has been established,
   * preventing subsequent container resizes from resetting user scroll position.
   */
  private initialMobileSet = false;
  private context: RackContext | null = null;
  private sortedPhases: number[] = [];

  setContext(context: RackContext) {
    this.context = context;
    this.sortedPhases = Array.from(
      new Set(context.nodes.map((n) => n.phase ?? 1))
    ).sort((a, b) => a - b);
    untrack(() => {
      this.clampPan();
      this.initMobileScroll();
    });
  }

  destroy() {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
  }

  updateHandles(id: string, handles: HandlePositions) {
    this.handlePositions[id] = handles;
  }

  getSourceHandle(nodeId: string, layoutedNodes?: ModuleNode[], isMobile?: boolean): XYPosition {
    if (this.handlePositions[nodeId]?.source) {
      return this.handlePositions[nodeId].source;
    }
    const nodes = layoutedNodes ?? this.context?.layoutedNodes;
    const mobile = isMobile ?? this.context?.isMobile ?? false;
    const node = nodes?.find((n) => n.id === nodeId);
    return getFallbackSourceHandle(node, mobile);
  }

  getTargetHandle(nodeId: string, layoutedNodes?: ModuleNode[], isMobile?: boolean): XYPosition {
    if (this.handlePositions[nodeId]?.target) {
      return this.handlePositions[nodeId].target;
    }
    const nodes = layoutedNodes ?? this.context?.layoutedNodes;
    const mobile = isMobile ?? this.context?.isMobile ?? false;
    const node = nodes?.find((n) => n.id === nodeId);
    return getFallbackTargetHandle(node, mobile);
  }

  clampPan() {
    if (!this.context) return;
    const { isMobile, rackWidth, rackHeight, containerWidth, containerHeight } = this.context;
    if (!isMobile) {
      const maxScrollX = Math.max(0, rackWidth - containerWidth);
      const currentX = untrack(() => this.panX);
      const clampedX = Math.min(0, Math.max(-maxScrollX, currentX));
      if (currentX !== clampedX) {
        this.panX = clampedX;
      }
      if (untrack(() => this.panY) !== 0) {
        this.panY = 0;
      }
    } else {
      const maxScrollY = Math.max(0, rackHeight - containerHeight);
      const currentY = untrack(() => this.panY);
      const clampedY = Math.min(0, Math.max(-maxScrollY, currentY));
      if (currentY !== clampedY) {
        this.panY = clampedY;
      }
      if (untrack(() => this.panX) !== 0) {
        this.panX = 0;
      }
    }
  }

  initMobileScroll() {
    if (!this.context) return;
    const { isMobile, containerHeight, layoutedNodes } = this.context;
    if (isMobile && containerHeight > 0 && !this.initialMobileSet) {
      let maxY = 0;
      for (const node of layoutedNodes) {
        if (node.position && node.position.y > maxY) {
          maxY = node.position.y;
        }
      }
      const targetY = Math.min(0, -(maxY - containerHeight + 150));
      if (untrack(() => this.panY) !== targetY) {
        this.panY = targetY;
      }
      this.initialMobileSet = true;
    }
  }

  validateConnection(sourceId: string, targetId: string): boolean {
    if (!this.context) return false;
    const { nodes, isValidConnection: customIsValidConnection } = this.context;

    if (customIsValidConnection) {
      return customIsValidConnection({ source: sourceId, target: targetId });
    }
    if (!sourceId || !targetId || sourceId === targetId) return false;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return false;

    if (sourceNode.data?.allowedTargets !== undefined) {
      return sourceNode.data.allowedTargets.includes(targetId);
    }

    const sourcePhase = sourceNode.phase ?? 1;
    const targetPhase = targetNode.phase ?? 1;

    const sourceIndex = this.sortedPhases.indexOf(sourcePhase);
    const targetIndex = this.sortedPhases.indexOf(targetPhase);

    return sourceIndex !== -1 && targetIndex === sourceIndex + 1;
  }

  startDrag(sourceId: string, event: PointerEvent) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const from = this.getSourceHandle(sourceId);
    const containerEl = this.context?.containerEl;
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
    event: PointerEvent
  ) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const edge = edges.find((e) => e.id === edgeId);
    const containerEl = this.context?.containerEl;
    if (!edge || !containerEl) return;

    const from = this.getSourceHandle(edge.source);
    const rect = containerEl.getBoundingClientRect();
    const to = {
      x: event.clientX - rect.left - this.panX,
      y: event.clientY - rect.top - this.panY
    };

    const targetPos = this.getTargetHandle(edge.target);
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

  handlePointerMove(event: PointerEvent) {
    const containerEl = this.context?.containerEl;
    if (!containerEl || this.snapAnimId !== null || !this.context) return;

    if (this.activeDrag) {
      const rect = containerEl.getBoundingClientRect();
      const worldX = event.clientX - rect.left - this.panX;
      const worldY = event.clientY - rect.top - this.panY;

      let matchedTargetId: string | null = null;
      let targetPos: XYPosition | null = null;
      let minDistance = Infinity;

      for (const node of this.context.layoutedNodes) {
        if (node.id === this.activeDrag.sourceId) continue;
        const candidatePos = this.getTargetHandle(node.id);
        const dist = Math.hypot(worldX - candidatePos.x, worldY - candidatePos.y);

        if (
          dist <= CONNECTION_SNAP_RADIUS &&
          this.validateConnection(this.activeDrag.sourceId, node.id)
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
      const { isMobile, rackWidth, rackHeight, containerWidth, containerHeight } = this.context;
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
    if (target?.closest('[data-pan-target]')) {
      this.isPanning = true;
      this.panStart = {
        x: event.clientX,
        y: event.clientY,
        panX: this.panX,
        panY: this.panY
      };
    }
  }

  handleWheel(event: WheelEvent) {
    if (!this.context) return;
    const { isMobile, rackWidth, rackHeight, containerWidth, containerHeight } = this.context;

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
