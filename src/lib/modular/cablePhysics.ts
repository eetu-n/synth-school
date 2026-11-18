import { PLUG_LENGTH, PLUG_SHAFT_LENGTH } from './constants';

export interface DroopOptions {
  slack?: number;
  dynamicOffset?: number;
  vertical?: boolean;
}

export interface CablePathResult {
  path: string;
  shadowPath: string;
  plugAngleDeg: number;
  shadowOffsetY: number;
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
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

export function calculateDroopPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: DroopOptions = {}
): CablePathResult {
  if (
    isNaN(x1) ||
    isNaN(y1) ||
    isNaN(x2) ||
    isNaN(y2)
  ) {
    return {
      path: '',
      shadowPath: '',
      plugAngleDeg: 0,
      shadowOffsetY: 0,
      cp1: { x: 0, y: 0 },
      cp2: { x: 0, y: 0 }
    };
  }

  const slack = options.slack ?? 1.0;
  const dynamicOffset = options.dynamicOffset ?? 0;
  const isVertical = options.vertical ?? (Math.abs(y2 - y1) > Math.abs(x2 - x1) * 1.25);

  // Terminate cable at the back of the inserted plug's strain relief boot
  const insertedPlugLength = PLUG_LENGTH - PLUG_SHAFT_LENGTH;
  const endX = isVertical ? x2 : x2 - insertedPlugLength;
  const endY = isVertical ? y2 + insertedPlugLength : y2;

  const dx = endX - x1;
  const dy = endY - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (isVertical) {
    const h = Math.abs(dy);
    const verticalSpread = Math.min(250, Math.max(50, h * 0.35));
    const sag = 60 * slack + dynamicOffset;
    const minX = Math.min(x1, endX);
    const cp1x = minX - sag;
    const cp2x = minX - sag;

    let cp1y: number;
    let cp2y: number;

    if (dy <= 0) {
      // Bottom-up (source below target)
      cp1y = y1 - verticalSpread;
      cp2y = endY + verticalSpread;
    } else {
      // Top-down
      cp1y = y1 + verticalSpread;
      cp2y = endY - verticalSpread;
    }

    const shadowOffsetX = 12;
    const shadowOffsetY = 15;

    return {
      path: formatBezierPath(x1, y1, cp1x, cp1y, cp2x, cp2y, endX, endY),
      shadowPath: formatBezierPath(x1, y1, cp1x, cp1y, cp2x, cp2y, endX, endY, shadowOffsetX, shadowOffsetY),
      plugAngleDeg: -90,
      shadowOffsetY,
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y }
    };
  }

  const horizontalSpread = Math.min(550, Math.max(90, Math.abs(dx) * 0.4));
  const cp1x = x1 + horizontalSpread;
  const cp2x = endX - horizontalSpread;

  // Natural gravity droop
  const sag = 90 * slack + Math.min(Math.abs(dx), 1000) * 0.18 * slack + dynamicOffset;
  const verticalRatio = dist > 0 ? Math.abs(dy) / dist : 0;

  let cp1y: number;
  let cp2y: number;

  if (dy >= 0) {
    // Source above target (or same horizontal level)
    const dyFactor = Math.min(dy * 0.3, 300);
    const grav1 = sag * Math.max(0.2, 1 - verticalRatio * 0.7);
    cp1y = y1 + dyFactor + grav1;

    // Cable only dips below target if vertical offset is small compared to horizontal
    const dip = sag * Math.max(0, 1 - verticalRatio * 1.25);
    const lift = Math.min(dy * 0.25, 200) * verticalRatio;
    cp2y = endY + dip - lift;
  } else {
    // Target above source
    cp1y = y1 + sag * Math.max(0.3, 1 - verticalRatio * 0.5);
    const rise = Math.min(Math.abs(dy) * 0.25, 200) * verticalRatio;
    cp2y = endY + sag * Math.max(0.1, 1 - verticalRatio) + rise;
  }

  const shadowOffsetY = Math.min(45, Math.max(20, sag * 0.14));

  return {
    path: formatBezierPath(x1, y1, cp1x, cp1y, cp2x, cp2y, endX, endY),
    shadowPath: formatBezierPath(x1, y1, cp1x, cp1y, cp2x, cp2y, endX, endY, 0, shadowOffsetY),
    plugAngleDeg: 0,
    shadowOffsetY,
    cp1: { x: cp1x, y: cp1y },
    cp2: { x: cp2x, y: cp2y }
  };
}

export interface SpringState {
  displacement: number;
  velocity: number;
}

export function stepSpring(state: SpringState, stiffness = 0.08, damping = 0.35): SpringState {
  const acceleration = -stiffness * state.displacement - damping * state.velocity;
  const velocity = state.velocity + acceleration;
  const displacement = state.displacement + velocity;

  if (Math.abs(displacement) < 0.05 && Math.abs(velocity) < 0.05) {
    return { displacement: 0, velocity: 0 };
  }

  return { displacement, velocity };
}

export class CableSpringAnimation {
  private state: SpringState = { displacement: 0, velocity: 0 };
  private animFrameId: number | null = null;
  private onChange: (displacement: number) => void;
  private prevCoords: { x1: number; y1: number; x2: number; y2: number } | null = null;

  constructor(onChange: (displacement: number) => void) {
    this.onChange = onChange;
  }

  trackEndpoints(x1: number, y1: number, x2: number, y2: number) {
    if (this.prevCoords !== null) {
      const dx = (x1 - this.prevCoords.x1) + (x2 - this.prevCoords.x2);
      const dy = (y1 - this.prevCoords.y1) + (y2 - this.prevCoords.y2);
      const movement = Math.hypot(dx, dy);
      this.applyImpulse(dy, movement);
    }
    this.prevCoords = { x1, y1, x2, y2 };
  }

  settle(displacement = 3) {
    this.state = { displacement, velocity: 0 };
    this.onChange(this.state.displacement);
    this.start();
  }

  applyImpulse(dy: number, movement: number) {
    if (movement > 1) {
      const impulse = Math.min(7, Math.max(2, movement * 0.25));
      this.state = {
        displacement: this.state.displacement,
        velocity: this.state.velocity + (dy < 0 ? -impulse : impulse)
      };
      this.start();
    }
  }

  private start() {
    if (typeof requestAnimationFrame === 'undefined' || this.animFrameId !== null) return;
    const tick = () => {
      if (Math.abs(this.state.displacement) > 0.05 || Math.abs(this.state.velocity) > 0.05) {
        this.state = stepSpring(this.state);
        this.onChange(this.state.displacement);
        this.animFrameId = requestAnimationFrame(tick);
      } else {
        this.state = { displacement: 0, velocity: 0 };
        this.onChange(0);
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
  dynamicOffset?: number;
  scrub?: number;
  targetX?: number;
  targetY?: number;
  vertical?: boolean;
}

export interface DragCableResult {
  path: string;
  shadowPath: string;
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
  if (
    isNaN(fromX) ||
    isNaN(fromY) ||
    isNaN(toX) ||
    isNaN(toY)
  ) {
    return {
      path: '',
      shadowPath: '',
      plugAngleDeg: 0,
      tipX: 0,
      tipY: 0,
      bootX: 0,
      bootY: 0
    };
  }

  const scrub = Math.max(0, Math.min(1, options.scrub ?? 0));
  const slack = options.slack ?? 1.0;
  const dynamicOffset = options.dynamicOffset ?? 0;

  const alignProgress = Math.min(1, scrub * 2);
  const insertProgress = Math.max(0, (scrub - 0.5) * 2);
  const plugLength = PLUG_LENGTH - PLUG_SHAFT_LENGTH * insertProgress;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);

  // Natural drag angle from source to mouse
  const directAngle = dist > 1 ? Math.atan2(dy, dx) : 0;

  // Slight natural upward tilt from gravity sag when dragging to the right
  const sagMagnitude = 75 * slack + Math.min(dist, 900) * 0.16 * slack + dynamicOffset;
  const sagTilt = dx >= 0 ? Math.min(0.22, (sagMagnitude / Math.max(140, dist)) * 0.35) : 0;
  const freeAngle = directAngle - sagTilt;
  const freeAngleDeg = (freeAngle * 180) / Math.PI;

  // If a target position is provided (or when scrub > 0), blend smoothly into the exact resting curve
  const targetX = options.targetX ?? toX;
  const targetY = options.targetY ?? toY;
  const hasTarget = options.targetX !== undefined && options.targetY !== undefined;

  let restCurve: CablePathResult | null = null;
  if (hasTarget && scrub > 0) {
    restCurve = calculateDroopPath(fromX, fromY, targetX, targetY, {
      slack,
      dynamicOffset,
      vertical: options.vertical
    });
  }

  // Smooth blending weight towards resting curve and horizontal alignment
  const w = scrub > 0 && restCurve ? Math.pow(scrub, 1.2) : 0;
  const wAlign = Math.pow(alignProgress, 1.2);

  let plugAngleDeg = freeAngleDeg;
  if (restCurve && wAlign > 0) {
    let angleDiff = restCurve.plugAngleDeg - freeAngleDeg;
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;
    plugAngleDeg = freeAngleDeg + angleDiff * wAlign;
  }

  const plugAngleRad = (plugAngleDeg * Math.PI) / 180;
  const cosA = Math.cos(plugAngleRad);
  const sinA = Math.sin(plugAngleRad);

  // Exact boot coordinate (where cable attaches to the plug)
  const bootX = toX - plugLength * cosA;
  const bootY = toY - plugLength * sinA;

  // Cable span between source and boot
  const cableDx = bootX - fromX;
  const cableDy = bootY - fromY;
  const cableDist = Math.hypot(cableDx, cableDy);

  // Dynamic drag control points
  const cableSag = Math.max(
    15,
    70 * slack + Math.min(cableDist, 900) * 0.16 * slack + dynamicOffset
  );
  const lead1 = Math.min(200, Math.max(45, cableDist * 0.35));
  const lead2 = Math.min(200, Math.max(45, cableDist * 0.35));

  const dragP1x = options.vertical ? fromX - cableSag * 0.7 : fromX + lead1;
  const dragP1y = options.vertical
    ? fromY - lead1
    : fromY + cableSag * 0.7 + (cableDy > 0 ? cableDy * 0.2 : 0);
  const dragP2x = bootX - lead2 * cosA;
  const dragP2y = bootY - lead2 * sinA;

  // Interpolate towards resting control points so at scrub = 1 it matches calculateDroopPath 100%
  const p0x = fromX;
  const p0y = fromY;
  const p1x = restCurve ? (1 - w) * dragP1x + w * restCurve.cp1.x : dragP1x;
  const p1y = restCurve ? (1 - w) * dragP1y + w * restCurve.cp1.y : dragP1y;
  const p2x = restCurve ? (1 - w) * dragP2x + w * restCurve.cp2.x : dragP2x;
  const p2y = restCurve ? (1 - w) * dragP2y + w * restCurve.cp2.y : dragP2y;
  const p3x = bootX;
  const p3y = bootY;

  const path = formatBezierPath(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);

  const dragShadowOffsetY = Math.min(45, Math.max(20, cableSag * 0.14));
  const restShadowOffsetY = restCurve ? restCurve.shadowOffsetY : dragShadowOffsetY;
  const shadowOffsetY = (1 - w) * dragShadowOffsetY + w * restShadowOffsetY;

  const shadowPath = formatBezierPath(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, 0, shadowOffsetY);

  return {
    path,
    shadowPath,
    plugAngleDeg,
    tipX: toX,
    tipY: toY,
    bootX,
    bootY
  };
}
