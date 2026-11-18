import { PLUG_LENGTH, PLUG_SHAFT_LENGTH } from './constants';

export interface Vector2D {
  x: number;
  y: number;
}

export interface DroopOptions {
  slack?: number;
  dynamicOffset?: number | Vector2D;
  vertical?: boolean;
}

export interface CablePathResult {
  path: string;
  shadowPath: string;
  highlightPath: string;
  plugAngleDeg: number;
  shadowOffsetY: number;
  cp1: Vector2D;
  cp2: Vector2D;
}

function formatBezierPath(
  x1: number,
  y1: number,
  cp1x: number,
  cp1y: number,
  cp2x: number,
  cp2y: number,
  x2: number,
  y2: number,
  offsetX = 0,
  offsetY = 0
): string {
  return `M ${(x1 + offsetX).toFixed(1)} ${(y1 + offsetY).toFixed(1)} C ${(cp1x + offsetX).toFixed(1)} ${(cp1y + offsetY).toFixed(1)}, ${(cp2x + offsetX).toFixed(1)} ${(cp2y + offsetY).toFixed(1)}, ${(x2 + offsetX).toFixed(1)} ${(y2 + offsetY).toFixed(1)}`;
}

function normalizeOffset(dynamicOffset?: number | Vector2D): Vector2D {
  if (typeof dynamicOffset === 'number') {
    return { x: 0, y: dynamicOffset };
  }
  return dynamicOffset ?? { x: 0, y: 0 };
}

function solveCableCurve(
  p0: Vector2D,
  dir0: Vector2D,
  p3: Vector2D,
  dir3: Vector2D,
  slack: number,
  offset: Vector2D,
  liftProgress: number,
  plugAngleDeg: number
): CablePathResult {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const dist = Math.hypot(dx, dy);

  const forward = Math.max(0, dx * dir0.x + dy * dir0.y);
  const lead = Math.min(450, Math.max(65, forward * 0.28 + dist * 0.14));
  const sag = (75 + Math.min(dist, 1000) * 0.16) * slack;

  const ry = dist > 0 ? dy / dist : 0;
  const rx = dist > 0 ? Math.abs(dx) / dist : 0;

  // Downward gravity droop (+y), attenuated on upward vertical exits so cables rise cleanly first
  const g1 =
    sag *
    (0.72 + 0.32 * Math.max(0, ry) - 0.25 * Math.max(0, -ry)) *
    (1 - 0.55 * Math.max(0, -dir0.y));
  const g2 =
    sag *
    (0.72 + 0.32 * Math.max(0, -ry) - 0.35 * Math.max(0, ry)) *
    (1 - 0.55 * Math.max(0, -dir3.y));

  // Lateral slack buckling (x) proportional to vertical port alignment
  const vert1 = Math.abs(dir0.y);
  const vert2 = Math.abs(dir3.y);
  const lateralScale = 1 - 0.35 * rx;
  const buckle1 = -vert1 * sag * 0.68 * lateralScale + vert1 * dx * 0.22;
  const buckle2 = -vert2 * sag * 0.68 * lateralScale - vert2 * dx * 0.22;

  const cp1: Vector2D = {
    x: p0.x + dir0.x * lead + buckle1 + offset.x,
    y: p0.y + dir0.y * lead + g1 + offset.y
  };
  const cp2: Vector2D = {
    x: p3.x + dir3.x * lead + buckle2 + offset.x,
    y: p3.y + dir3.y * lead + g2 + offset.y
  };

  const path = formatBezierPath(p0.x, p0.y, cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);

  const highlightPath = formatBezierPath(
    p0.x - 0.8,
    p0.y - 1.2,
    cp1.x - 1.2,
    cp1.y - 1.8,
    cp2.x - 1.2,
    cp2.y - 1.8,
    p3.x - 0.8,
    p3.y - 1.2
  );

  // Pin-anchored perspective shadow: grounded at ports, deeper under hanging belly
  const shadowOffsetX = 10;
  const shadowOffsetY = Math.min(42, Math.max(18, sag * 0.16));
  const endShadowX = 3 + 9 * liftProgress;
  const endShadowY = 5 + 17 * liftProgress;

  const shadowPath = formatBezierPath(
    p0.x + 2,
    p0.y + 3,
    cp1.x + shadowOffsetX,
    cp1.y + shadowOffsetY,
    cp2.x + shadowOffsetX,
    cp2.y + shadowOffsetY,
    p3.x + endShadowX,
    p3.y + endShadowY
  );

  return {
    path,
    shadowPath,
    highlightPath,
    plugAngleDeg,
    shadowOffsetY,
    cp1,
    cp2
  };
}

export function calculateDroopPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: DroopOptions = {}
): CablePathResult {
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    return {
      path: '',
      shadowPath: '',
      highlightPath: '',
      plugAngleDeg: 0,
      shadowOffsetY: 0,
      cp1: { x: 0, y: 0 },
      cp2: { x: 0, y: 0 }
    };
  }

  const slack = options.slack ?? 1.0;
  const offset = normalizeOffset(options.dynamicOffset);
  const isVertical = options.vertical ?? Math.abs(y2 - y1) > Math.abs(x2 - x1) * 1.25;

  const restAngleDeg = isVertical ? -90 : 0;
  const dir0: Vector2D = isVertical ? { x: 0, y: -1 } : { x: 1, y: 0 };
  const dir3: Vector2D = isVertical ? { x: 0, y: 1 } : { x: -1, y: 0 };

  // Terminate cable at the back of the inserted plug's strain relief boot
  const insertedPlugLength = PLUG_LENGTH - PLUG_SHAFT_LENGTH;
  const p0: Vector2D = { x: x1, y: y1 };
  const p3: Vector2D = {
    x: x2 + dir3.x * insertedPlugLength,
    y: y2 + dir3.y * insertedPlugLength
  };

  return solveCableCurve(p0, dir0, p3, dir3, slack, offset, 0, restAngleDeg);
}

export interface SpringState {
  displacement: number;
  velocity: number;
}

export interface SpringState2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function stepSpring2D(
  state: SpringState2D,
  stiffness = 0.08,
  damping = 0.35
): SpringState2D {
  const vx = state.vx + (-stiffness * state.x - damping * state.vx);
  const vy = state.vy + (-stiffness * state.y - damping * state.vy);
  const x = state.x + vx;
  const y = state.y + vy;

  if (Math.hypot(x, y) < 0.05 && Math.hypot(vx, vy) < 0.05) {
    return { x: 0, y: 0, vx: 0, vy: 0 };
  }

  return { x, y, vx, vy };
}

export function stepSpring(state: SpringState, stiffness = 0.08, damping = 0.35): SpringState {
  const next = stepSpring2D(
    { x: state.displacement, y: 0, vx: state.velocity, vy: 0 },
    stiffness,
    damping
  );
  return { displacement: next.x, velocity: next.vx };
}

export class CableSpringAnimation {
  private state: SpringState2D = { x: 0, y: 0, vx: 0, vy: 0 };
  private animFrameId: number | null = null;
  private onChange: (offset: Vector2D) => void;
  private prevCoords: { x1: number; y1: number; x2: number; y2: number } | null = null;

  constructor(onChange: (offset: Vector2D) => void) {
    this.onChange = onChange;
  }

  trackEndpoints(x1: number, y1: number, x2: number, y2: number) {
    if (this.prevCoords !== null) {
      const dx = x1 - this.prevCoords.x1 + (x2 - this.prevCoords.x2);
      const dy = y1 - this.prevCoords.y1 + (y2 - this.prevCoords.y2);
      if (Math.hypot(dx, dy) > 1) {
        const rawIx = -dx * 0.22;
        const rawIy = -dy * 0.22;
        const rawMag = Math.hypot(rawIx, rawIy);
        const clampedMag = Math.min(9, rawMag);
        const scale = rawMag > 0 ? clampedMag / rawMag : 0;
        this.applyImpulse2D(rawIx * scale, rawIy * scale);
      }
    }
    this.prevCoords = { x1, y1, x2, y2 };
  }

  settle(displacement: number | Vector2D = 3) {
    const offset = normalizeOffset(displacement);
    this.state = { x: offset.x, y: offset.y, vx: 0, vy: 0 };
    this.onChange({ x: this.state.x, y: this.state.y });
    this.start();
  }

  applyImpulse2D(ix: number, iy: number) {
    const vx = this.state.vx + ix;
    const vy = this.state.vy + iy;
    const speed = Math.hypot(vx, vy);
    const maxSpeed = 28;
    const scale = speed > maxSpeed ? maxSpeed / speed : 1;

    this.state = {
      ...this.state,
      vx: vx * scale,
      vy: vy * scale
    };
    this.start();
  }

  applyImpulse(dy: number, movement: number) {
    if (movement > 1) {
      const impulse = Math.min(7, Math.max(2, movement * 0.25));
      this.applyImpulse2D(0, dy < 0 ? -impulse : impulse);
    }
  }

  private start() {
    if (typeof requestAnimationFrame === 'undefined' || this.animFrameId !== null) return;
    const tick = () => {
      if (
        Math.hypot(this.state.x, this.state.y) > 0.05 ||
        Math.hypot(this.state.vx, this.state.vy) > 0.05
      ) {
        this.state = stepSpring2D(this.state);
        this.onChange({ x: this.state.x, y: this.state.y });
        this.animFrameId = requestAnimationFrame(tick);
      } else {
        this.state = { x: 0, y: 0, vx: 0, vy: 0 };
        this.onChange({ x: 0, y: 0 });
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  destroy() {
    if (typeof cancelAnimationFrame !== 'undefined' && this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

export interface DragCableOptions {
  slack?: number;
  dynamicOffset?: number | Vector2D;
  scrub?: number;
  targetX?: number;
  targetY?: number;
  vertical?: boolean;
}

export interface DragCableResult {
  path: string;
  shadowPath: string;
  highlightPath: string;
  plugAngleDeg: number;
  tipX: number;
  tipY: number;
  bootX: number;
  bootY: number;
}

export function calculateDragCablePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: DragCableOptions = {}
): DragCableResult {
  if (isNaN(fromX) || isNaN(fromY) || isNaN(toX) || isNaN(toY)) {
    return {
      path: '',
      shadowPath: '',
      highlightPath: '',
      plugAngleDeg: 0,
      tipX: 0,
      tipY: 0,
      bootX: 0,
      bootY: 0
    };
  }

  const scrub = Math.max(0, Math.min(1, options.scrub ?? 0));
  const slack = options.slack ?? 1.0;
  const offset = normalizeOffset(options.dynamicOffset);
  const isVertical = options.vertical ?? false;

  const alignProgress = Math.min(1, scrub * 2);
  const insertProgress = Math.max(0, (scrub - 0.5) * 2);
  const plugLength = PLUG_LENGTH - PLUG_SHAFT_LENGTH * insertProgress;

  const dir0: Vector2D = isVertical ? { x: 0, y: -1 } : { x: 1, y: 0 };
  const restAngleDeg = isVertical ? -90 : 0;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);

  // Natural arrival tangent from sagged/swaying cable belly to the dragged plug tip
  const reach = Math.min(1, dist / 220);
  const sagMag = (70 + Math.min(dist, 900) * 0.15) * slack;
  const bellyX =
    fromX + (dir0.x * 45 - Math.abs(dir0.y) * sagMag * 0.35) * reach + offset.x * 0.6;
  const bellyY = fromY + (dir0.y * 35 + sagMag * 0.38) * reach + offset.y * 0.6;

  const approachDx = toX - bellyX;
  const approachDy = toY - bellyY;
  const freeAngleDeg =
    Math.hypot(approachDx, approachDy) > 1
      ? (Math.atan2(approachDy, approachDx) * 180) / Math.PI
      : dist > 1
        ? (Math.atan2(dy, dx) * 180) / Math.PI
        : restAngleDeg;

  let angleDiff = restAngleDeg - freeAngleDeg;
  while (angleDiff > 180) angleDiff -= 360;
  while (angleDiff < -180) angleDiff += 360;

  const wAlign = Math.pow(alignProgress, 1.2);
  const plugAngleDeg = freeAngleDeg + angleDiff * wAlign;
  const plugAngleRad = (plugAngleDeg * Math.PI) / 180;
  const cosA = Math.cos(plugAngleRad);
  const sinA = Math.sin(plugAngleRad);

  const bootX = toX - plugLength * cosA;
  const bootY = toY - plugLength * sinA;
  const dir3: Vector2D = { x: -cosA, y: -sinA };

  const curve = solveCableCurve(
    { x: fromX, y: fromY },
    dir0,
    { x: bootX, y: bootY },
    dir3,
    slack,
    offset,
    1 - scrub,
    plugAngleDeg
  );

  return {
    path: curve.path,
    shadowPath: curve.shadowPath,
    highlightPath: curve.highlightPath,
    plugAngleDeg: curve.plugAngleDeg,
    tipX: toX,
    tipY: toY,
    bootX,
    bootY
  };
}
