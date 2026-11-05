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

  // Droop hangs below the jacks due to gravity
  const totalSag = (50 * slack + dist * 0.28 * slack + dynamicOffset);
  const lowestY = Math.max(y1, y2);

  let xSpread = dx * 0.15;
  if (Math.abs(dx) < 30) {
    xSpread += 20;
  }

  const cp1 = {
    x: x1 + xSpread,
    y: Math.max(lowestY + 25 * slack, y1 + totalSag + Math.max(0, dy * 0.25))
  };

  const cp2 = {
    x: x2 - xSpread,
    y: Math.max(lowestY + 25 * slack, y2 + totalSag + Math.max(0, -dy * 0.25))
  };

  const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const shadowOffsetY = Math.min(20, Math.max(10, totalSag * 0.15));
  const shadowPath = `M ${x1.toFixed(1)} ${(y1 + shadowOffsetY).toFixed(1)} C ${cp1.x.toFixed(1)} ${(cp1.y + shadowOffsetY).toFixed(1)}, ${cp2.x.toFixed(1)} ${(cp2.y + shadowOffsetY).toFixed(1)}, ${x2.toFixed(1)} ${(y2 + shadowOffsetY).toFixed(1)}`;

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
