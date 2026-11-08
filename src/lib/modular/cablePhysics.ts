export interface DroopOptions {
  slack?: number;
  dynamicOffset?: number;
}

export interface CablePathResult {
  path: string;
  shadowPath: string;
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
    return { path: '', shadowPath: '' };
  }

  const slack = options.slack ?? 1.0;
  const dynamicOffset = options.dynamicOffset ?? 0;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const horizontalSpread = Math.min(220, Math.max(35, Math.abs(dx) * 0.4));
  const cp1x = x1 + horizontalSpread;
  const cp2x = x2 - horizontalSpread;

  // Natural gravity droop
  const sag = 35 * slack + Math.min(Math.abs(dx), 400) * 0.18 * slack + dynamicOffset;
  const verticalRatio = dist > 0 ? Math.abs(dy) / dist : 0;

  let cp1y: number;
  let cp2y: number;

  if (dy >= 0) {
    // Source above target (or same horizontal level)
    const dyFactor = Math.min(dy * 0.3, 120);
    const grav1 = sag * Math.max(0.2, 1 - verticalRatio * 0.7);
    cp1y = y1 + dyFactor + grav1;

    // Cable only dips below target if vertical offset is small compared to horizontal
    const dip = sag * Math.max(0, 1 - verticalRatio * 1.25);
    const lift = Math.min(dy * 0.25, 80) * verticalRatio;
    cp2y = y2 + dip - lift;
  } else {
    // Target above source
    cp1y = y1 + sag * Math.max(0.3, 1 - verticalRatio * 0.5);
    const rise = Math.min(Math.abs(dy) * 0.25, 80) * verticalRatio;
    cp2y = y2 + sag * Math.max(0.1, 1 - verticalRatio) + rise;
  }

  const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const shadowOffsetY = Math.min(18, Math.max(8, sag * 0.14));
  const shadowPath = `M ${x1.toFixed(1)} ${(y1 + shadowOffsetY).toFixed(1)} C ${cp1x.toFixed(1)} ${(cp1y + shadowOffsetY).toFixed(1)}, ${cp2x.toFixed(1)} ${(cp2y + shadowOffsetY).toFixed(1)}, ${x2.toFixed(1)} ${(y2 + shadowOffsetY).toFixed(1)}`;

  return { path, shadowPath };
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
    if (movement > 2) {
      const impulse = Math.min(1.2, movement * 0.04);
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
