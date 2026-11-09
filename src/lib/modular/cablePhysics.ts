import { PLUG_SCALE } from './constants';

export interface DroopOptions {
  slack?: number;
  dynamicOffset?: number;
  vertical?: boolean;
}

export interface CablePathResult {
  path: string;
  shadowPath: string;
  endAngle: number;
  endAngleDeg: number;
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
}

export function calculateDroopPath(
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number,
  options: DroopOptions = {}
): CablePathResult {
  if (
    typeof x1 !== 'number' ||
    typeof y1 !== 'number' ||
    typeof x2 !== 'number' ||
    typeof y2 !== 'number' ||
    isNaN(x1) ||
    isNaN(y1) ||
    isNaN(x2) ||
    isNaN(y2)
  ) {
    return {
      path: '',
      shadowPath: '',
      endAngle: 0,
      endAngleDeg: 0,
      cp1: { x: 0, y: 0 },
      cp2: { x: 0, y: 0 }
    };
  }

  const slack = options.slack ?? 1.0;
  const dynamicOffset = options.dynamicOffset ?? 0;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const isVertical = options.vertical ?? (Math.abs(dy) > Math.abs(dx) * 1.25);

  if (isVertical) {
    const h = Math.abs(dy);
    const verticalSpread = Math.min(250, Math.max(50, h * 0.35));
    const sag = 60 * slack + dynamicOffset;
    const minX = Math.min(x1, x2);
    const cp1x = minX - sag;
    const cp2x = minX - sag;

    let cp1y: number;
    let cp2y: number;

    if (dy <= 0) {
      // Bottom-up (source below target)
      cp1y = y1 - verticalSpread;
      cp2y = y2 + verticalSpread;
    } else {
      // Top-down
      cp1y = y1 + verticalSpread;
      cp2y = y2 - verticalSpread;
    }

    const endDx = x2 - cp2x;
    const endDy = y2 - cp2y;
    const endAngle = Math.atan2(endDy, endDx);
    const endAngleDeg = (endAngle * 180) / Math.PI;

    const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    const shadowOffsetX = 12;
    const shadowOffsetY = 15;
    const shadowPath = `M ${(x1 + shadowOffsetX).toFixed(1)} ${(y1 + shadowOffsetY).toFixed(1)} C ${(cp1x + shadowOffsetX).toFixed(1)} ${(cp1y + shadowOffsetY).toFixed(1)}, ${(cp2x + shadowOffsetX).toFixed(1)} ${(cp2y + shadowOffsetY).toFixed(1)}, ${(x2 + shadowOffsetX).toFixed(1)} ${(y2 + shadowOffsetY).toFixed(1)}`;

    return {
      path,
      shadowPath,
      endAngle,
      endAngleDeg,
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y }
    };
  }

  const horizontalSpread = Math.min(550, Math.max(90, Math.abs(dx) * 0.4));
  const cp1x = x1 + horizontalSpread;
  const cp2x = x2 - horizontalSpread;

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
    cp2y = y2 + dip - lift;
  } else {
    // Target above source
    cp1y = y1 + sag * Math.max(0.3, 1 - verticalRatio * 0.5);
    const rise = Math.min(Math.abs(dy) * 0.25, 200) * verticalRatio;
    cp2y = y2 + sag * Math.max(0.1, 1 - verticalRatio) + rise;
  }

  const endDx = x2 - cp2x;
  const endDy = y2 - cp2y;
  const endAngle = Math.atan2(endDy, endDx);
  const endAngleDeg = (endAngle * 180) / Math.PI;

  const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const shadowOffsetY = Math.min(45, Math.max(20, sag * 0.14));
  const shadowPath = `M ${x1.toFixed(1)} ${(y1 + shadowOffsetY).toFixed(1)} C ${cp1x.toFixed(1)} ${(cp1y + shadowOffsetY).toFixed(1)}, ${cp2x.toFixed(1)} ${(cp2y + shadowOffsetY).toFixed(1)}, ${x2.toFixed(1)} ${(y2 + shadowOffsetY).toFixed(1)}`;

  return {
    path,
    shadowPath,
    endAngle,
    endAngleDeg,
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

  if (Math.abs(displacement) < 0.1 && Math.abs(velocity) < 0.1) {
    return { displacement: 0, velocity: 0 };
  }

  return { displacement, velocity };
}

export class CableSpringAnimation {
  private state: SpringState = { displacement: 0, velocity: 0 };
  private animFrameId: number | null = null;
  private onChange: (displacement: number) => void;

  constructor(onChange: (displacement: number) => void) {
    this.onChange = onChange;
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
  fromX?: number,
  fromY?: number,
  toX?: number,
  toY?: number,
  options: DragCableOptions = {}
): DragCableResult {
  if (
    typeof fromX !== 'number' ||
    typeof fromY !== 'number' ||
    typeof toX !== 'number' ||
    typeof toY !== 'number' ||
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

  // Full plug length from boot entry to conductive tip: 37.5 * PLUG_SCALE
  const fullPlugLength = 37.5 * PLUG_SCALE;
  const plugLength = fullPlugLength * (1 - scrub);

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
      dynamicOffset
    });
  }

  // Smooth blending weight towards resting curve
  const w = scrub > 0 && restCurve ? Math.pow(scrub, 1.2) : 0;

  let plugAngleDeg = freeAngleDeg;
  if (restCurve && w > 0) {
    let angleDiff = restCurve.endAngleDeg - freeAngleDeg;
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;
    plugAngleDeg = freeAngleDeg + angleDiff * w;
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

  const dragP1x = fromX + lead1;
  const dragP1y = fromY + cableSag * 0.7 + (cableDy > 0 ? cableDy * 0.2 : 0);
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

  const path = `M ${p0x.toFixed(1)} ${p0y.toFixed(1)} C ${p1x.toFixed(1)} ${p1y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}, ${p3x.toFixed(1)} ${p3y.toFixed(1)}`;

  const dragShadowOffsetY = Math.min(45, Math.max(20, cableSag * 0.14));
  const restShadowOffsetY = restCurve
    ? Math.min(
        45,
        Math.max(
          20,
          (90 * slack + Math.min(Math.abs(targetX - fromX), 1000) * 0.18 * slack + dynamicOffset) *
            0.14
        )
      )
    : dragShadowOffsetY;
  const shadowOffsetY = (1 - w) * dragShadowOffsetY + w * restShadowOffsetY;

  const shadowPath = `M ${p0x.toFixed(1)} ${(p0y + shadowOffsetY).toFixed(1)} C ${p1x.toFixed(1)} ${(p1y + shadowOffsetY).toFixed(1)}, ${p2x.toFixed(1)} ${(p2y + shadowOffsetY).toFixed(1)}, ${p3x.toFixed(1)} ${(p3y + shadowOffsetY).toFixed(1)}`;

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
