import { untrack } from 'svelte';
import type {
  ModuleNode,
  CableEdge,
  Connection,
  HandlePositions,
  XYPosition
} from './types';
import {
  CONNECTION_SNAP_RADIUS,
  JACK_LENGTH,
  PLUG_SCALE,
  PLUG_SHAFT_LENGTH
} from './constants';
import {
  computeRackLayout,
  getFallbackSourceHandle,
  getFallbackTargetHandle,
  type RackLayoutResult
} from './rackLayout';

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

export interface RackStateConfig {
  getNodes: () => ModuleNode[];
  getEdges: () => CableEdge[];
  getIsValidConnection?: () => ((connection: Connection) => boolean) | undefined;
  onEdgesChange: (edges: CableEdge[]) => void;
}

export class ModularRackState {
  containerEl = $state<HTMLElement | null>(null);
  containerWidth = $state(0);
  containerHeight = $state(0);

  panX = $state(0);
  panY = $state(0);
  isPanning = $state(false);
  activeDrag = $state<DragState | null>(null);

  layoutedNodes: ModuleNode[];
  rackWidth: number;
  rackHeight: number;

  private config: RackStateConfig;
  private layout: RackLayoutResult;
  private sortedPhases: number[];
  private unlockedNodeIds: Set<string>;
  private panStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private handlePositions = $state<Record<string, HandlePositions>>({});
  private snapAnimId: number | null = null;
  /**
   * Tracks whether the initial mobile scroll offset has been established,
   * preventing subsequent container resizes from resetting user scroll position.
   */
  private initialMobileSet = false;

  isMobile = $derived(
    this.containerWidth > 0
      ? this.containerWidth < 768
      : typeof window !== 'undefined'
        ? window.innerWidth < 768
        : false
  );

  constructor(config: RackStateConfig) {
    this.config = config;
    this.layout = $derived(
      computeRackLayout(
        this.config.getNodes(),
        this.containerWidth,
        this.containerHeight,
        this.isMobile
      )
    );
    this.layoutedNodes = $derived(this.layout.layoutedNodes);
    this.rackWidth = $derived(this.layout.rackWidth);
    this.rackHeight = $derived(this.layout.rackHeight);
    this.sortedPhases = $derived(
      Array.from(new Set(this.config.getNodes().map((n) => n.phase ?? 1))).sort((a, b) => a - b)
    );
    this.unlockedNodeIds = $derived.by(() => {
      const firstPhase = this.sortedPhases[0] ?? 1;
      const unlocked = new Set<string>();
      const queue: string[] = [];

      for (const node of this.config.getNodes()) {
        if ((node.phase ?? 1) === firstPhase) {
          unlocked.add(node.id);
          queue.push(node.id);
        }
      }

      const activeEdges = this.config
        .getEdges()
        .filter((e) => e.id !== this.activeDrag?.edgeId);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        for (const edge of activeEdges) {
          if (edge.source === currentId && !unlocked.has(edge.target)) {
            unlocked.add(edge.target);
            queue.push(edge.target);
          }
        }
      }

      return unlocked;
    });
  }

  isNodeUnlocked(nodeId: string): boolean {
    return this.unlockedNodeIds.has(nodeId);
  }

  syncViewport() {
    this.isMobile;
    this.rackWidth;
    this.rackHeight;
    this.containerWidth;
    this.containerHeight;
    this.layoutedNodes;

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

  getSourceHandle(nodeId: string): XYPosition {
    if (this.handlePositions[nodeId]?.source) {
      return this.handlePositions[nodeId].source;
    }
    const node = this.layoutedNodes.find((n) => n.id === nodeId);
    return getFallbackSourceHandle(node, this.isMobile);
  }

  getTargetHandle(nodeId: string): XYPosition {
    if (this.handlePositions[nodeId]?.target) {
      return this.handlePositions[nodeId].target;
    }
    const node = this.layoutedNodes.find((n) => n.id === nodeId);
    return getFallbackTargetHandle(node, this.isMobile);
  }

  private clientToWorld(event: PointerEvent): XYPosition | null {
    if (!this.containerEl) return null;
    const rect = this.containerEl.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - this.panX,
      y: event.clientY - rect.top - this.panY
    };
  }

  private applyJackDetent(u: number): number {
    if (u <= 0) return 0;
    if (u >= 1) return 1;

    // C1 piecewise cubic Hermite curve: bore entry -> retention spring resistance -> neck-groove snap-in
    const [u0, u1, y0, y1, m0, m1] =
      u <= 0.35
        ? [0, 0.35, 0, 0.32, 1.1, 0.25]
        : u <= 0.72
          ? [0.35, 0.72, 0.32, 0.42, 0.25, 0.35]
          : [0.72, 1, 0.42, 1, 0.35, 1.2];

    const h = u1 - u0;
    const s = (u - u0) / h;
    const s2 = s * s;
    const s3 = s2 * s;

    return (
      (2 * s3 - 3 * s2 + 1) * y0 +
      (s3 - 2 * s2 + s) * h * m0 +
      (-2 * s3 + 3 * s2) * y1 +
      (s3 - s2) * h * m1
    );
  }

  private computeSnap(
    worldX: number,
    worldY: number,
    targetPos: XYPosition
  ): { dist: number; scrub: number; to: XYPosition } | null {
    const insertDist = PLUG_SHAFT_LENGTH * PLUG_SCALE;
    const jackWidth = JACK_LENGTH * PLUG_SCALE;

    let dSeg: number;
    let rawInsert: number;

    if (this.isMobile) {
      const segY = Math.max(targetPos.y - jackWidth, Math.min(targetPos.y + insertDist, worldY));
      dSeg = Math.hypot(worldX - targetPos.x, worldY - segY);
      rawInsert = Math.max(0, Math.min(1, 1 - (worldY - targetPos.y) / insertDist));
    } else {
      const segX = Math.max(targetPos.x - insertDist, Math.min(targetPos.x + jackWidth, worldX));
      dSeg = Math.hypot(worldX - segX, worldY - targetPos.y);
      rawInsert = Math.max(0, Math.min(1, 1 - (targetPos.x - worldX) / insertDist));
    }

    if (dSeg > CONNECTION_SNAP_RADIUS) return null;

    const alignHoldRadius = 24;
    const t = Math.max(
      0,
      Math.min(1, (CONNECTION_SNAP_RADIUS - dSeg) / (CONNECTION_SNAP_RADIUS - alignHoldRadius))
    );
    const align = t * t * (3 - 2 * t);
    const detentInsert = this.applyJackDetent(rawInsert);

    // Phase 1 (0..0.5): horizontal alignment at jack mouth; Phase 2 (0.5..1): horizontal insertion
    const scrub = 0.5 * align + 0.5 * detentInsert * Math.pow(align, 2);
    const alignProgress = Math.min(1, scrub * 2);

    return {
      dist: dSeg,
      scrub,
      to: {
        x: worldX + (targetPos.x - worldX) * alignProgress,
        y: worldY + (targetPos.y - worldY) * alignProgress
      }
    };
  }

  private setClampedPan(x: number, y: number) {
    if (!this.isMobile) {
      const maxScrollX = Math.max(0, this.rackWidth - this.containerWidth);
      const clampedX = Math.min(0, Math.max(-maxScrollX, x));
      if (this.panX !== clampedX) {
        this.panX = clampedX;
      }
      if (this.panY !== 0) {
        this.panY = 0;
      }
    } else {
      const maxScrollY = Math.max(0, this.rackHeight - this.containerHeight);
      const clampedY = Math.min(0, Math.max(-maxScrollY, y));
      if (this.panY !== clampedY) {
        this.panY = clampedY;
      }
      if (this.panX !== 0) {
        this.panX = 0;
      }
    }
  }

  clampPan() {
    this.setClampedPan(this.panX, this.panY);
  }

  initMobileScroll() {
    if (this.isMobile && this.containerHeight > 0 && !this.initialMobileSet) {
      let maxY = 0;
      for (const node of this.layoutedNodes) {
        if (node.position && node.position.y > maxY) {
          maxY = node.position.y;
        }
      }
      const targetY = Math.min(0, -(maxY - this.containerHeight + 150));
      if (this.panY !== targetY) {
        this.panY = targetY;
      }
      this.initialMobileSet = true;
    }
  }

  validateConnection(sourceId: string, targetId: string): boolean {
    const customIsValidConnection = this.config.getIsValidConnection?.();
    if (customIsValidConnection) {
      return customIsValidConnection({ source: sourceId, target: targetId });
    }
    if (!sourceId || !targetId || sourceId === targetId) return false;

    const nodes = this.config.getNodes();
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
    if (!this.isNodeUnlocked(sourceId)) return;
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const to = this.clientToWorld(event);
    if (!to) return;

    this.activeDrag = {
      type: 'new',
      sourceId,
      from: this.getSourceHandle(sourceId),
      to,
      hoveredTargetId: null,
      targetPos: null,
      scrub: 0
    };
  }

  startReconnect(edgeId: string, event: PointerEvent) {
    if (this.snapAnimId !== null) {
      cancelAnimationFrame(this.snapAnimId);
      this.snapAnimId = null;
    }
    event.stopPropagation();
    event.preventDefault();

    const edge = this.config.getEdges().find((e) => e.id === edgeId);
    const world = this.clientToWorld(event);
    if (!edge || !world) return;

    const targetPos = this.getTargetHandle(edge.target);
    const snap = this.computeSnap(world.x, world.y, targetPos);

    this.activeDrag = {
      type: 'reconnect',
      edgeId,
      sourceId: edge.source,
      from: this.getSourceHandle(edge.source),
      to: snap ? snap.to : world,
      hoveredTargetId: snap ? edge.target : null,
      targetPos: snap ? targetPos : null,
      scrub: snap ? snap.scrub : 0
    };
  }

  handlePointerMove(event: PointerEvent) {
    if (!this.containerEl || this.snapAnimId !== null) return;

    if (this.activeDrag) {
      const world = this.clientToWorld(event);
      if (!world) return;
      const { x: worldX, y: worldY } = world;

      let matchedTargetId: string | null = null;
      let targetPos: XYPosition | null = null;
      let matchedSnap: { dist: number; scrub: number; to: XYPosition } | null = null;
      let minDistance = Infinity;

      for (const node of this.layoutedNodes) {
        if (node.id === this.activeDrag.sourceId) continue;
        if (!this.validateConnection(this.activeDrag.sourceId, node.id)) continue;

        const candidatePos = this.getTargetHandle(node.id);
        const snap = this.computeSnap(worldX, worldY, candidatePos);

        if (snap && snap.dist < minDistance) {
          minDistance = snap.dist;
          matchedTargetId = node.id;
          targetPos = candidatePos;
          matchedSnap = snap;
        }
      }

      if (matchedTargetId && targetPos && matchedSnap) {
        this.activeDrag.to = matchedSnap.to;
        this.activeDrag.hoveredTargetId = matchedTargetId;
        this.activeDrag.targetPos = targetPos;
        this.activeDrag.scrub = matchedSnap.scrub;
      } else {
        this.activeDrag.to = { x: worldX, y: worldY };
        this.activeDrag.hoveredTargetId = null;
        this.activeDrag.targetPos = null;
        this.activeDrag.scrub = 0;
      }
    } else if (this.isPanning) {
      if (!this.isMobile) {
        const dx = event.clientX - this.panStart.x;
        this.setClampedPan(this.panStart.panX + dx, this.panY);
      } else {
        const dy = event.clientY - this.panStart.y;
        this.setClampedPan(this.panX, this.panStart.panY + dy);
      }
    }
  }

  handlePointerUp() {
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
        const edges = this.config.getEdges();
        if (dragType === 'new' && targetId) {
          const newEdge: CableEdge = {
            id: `cable-${sourceId}-${targetId}-${Date.now()}`,
            source: sourceId,
            target: targetId
          };
          this.config.onEdgesChange([...edges.filter((e) => e.source !== sourceId), newEdge]);
        } else if (dragType === 'reconnect' && edgeId && targetId) {
          this.config.onEdgesChange(
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
              const nextScrub = startScrub + (1 - startScrub) * ease;
              const alignT =
                startScrub >= 0.5
                  ? 1
                  : Math.min(1, (nextScrub - startScrub) / (0.5 - startScrub));

              this.activeDrag.scrub = nextScrub;
              this.activeDrag.to = {
                x: startTo.x + (targetPos.x - startTo.x) * alignT,
                y: startTo.y + (targetPos.y - startTo.y) * alignT
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
        this.config.onEdgesChange(this.config.getEdges().filter((e) => e.id !== edgeId));
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
    if (!this.isMobile) {
      const delta =
        event.deltaMode === 1
          ? event.deltaY * 20
          : Math.abs(event.deltaY) > Math.abs(event.deltaX)
            ? event.deltaY
            : event.deltaX;

      this.setClampedPan(this.panX - delta, this.panY);
      event.preventDefault();
    } else {
      const delta = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
      this.setClampedPan(this.panX, this.panY - delta);
      event.preventDefault();
    }
  }
}
