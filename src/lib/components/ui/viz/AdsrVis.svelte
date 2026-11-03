<script lang="ts">
  interface Props {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    gate?: boolean;
    class?: string;
    interactive?: boolean;
    showStageCards?: boolean;
  }

  let {
    attack = $bindable(10),
    decay = $bindable(100),
    sustain = $bindable(0.7),
    release = $bindable(100),
    gate = $bindable(false),
    class: className = "",
    interactive = false,
    showStageCards = false,
  }: Props = $props();

  // --- Visualizer Dimensions ---
  const width = 800;
  const height = 260;
  const padL = 50;
  const padR = 35;
  const padT = 35;
  const padB = 45;

  const plotW = width - padL - padR; // 715
  const plotH = height - padT - padB; // 180

  const y0 = padT + plotH; // 215 (baseline 0)
  const y1 = padT;         // 35  (peak 1.0)

  function getY(v: number): number {
    const clamped = Math.max(0, Math.min(1, v));
    return y0 - clamped * (y0 - y1);
  }

  // Continuous logarithmic scaling:
  // Strictly 0.0 at 0ms (so curve is vertical).
  // Continuous from 0ms upward (~4px at 1ms) so there is no jarring jump.
  function getPhaseWidth(timeMs: number): number {
    const clamped = Math.max(0, Math.min(5000, timeMs));
    if (clamped <= 0) return 0;
    const norm = Math.log(1 + 0.1 * clamped) / Math.log(1 + 0.1 * 5000);
    return norm * 260;
  }

  let rawWA = $derived(getPhaseWidth(attack));
  let rawWD = $derived(getPhaseWidth(decay));
  let rawWR = $derived(getPhaseWidth(release));

  // Ensure sustain always has at least 75px for its animated capsule
  const minSustainWidth = 75;
  const maxAllowedTimeTotal = $derived(plotW - minSustainWidth);

  let timeSum = $derived(rawWA + rawWD + rawWR);
  let scale = $derived(timeSum > maxAllowedTimeTotal ? maxAllowedTimeTotal / timeSum : 1);

  let attackWidth = $derived(rawWA * scale);
  let decayWidth = $derived(rawWD * scale);
  let releaseWidth = $derived(rawWR * scale);

  let x0 = $derived(padL);
  let x1 = $derived(x0 + attackWidth);
  let x2 = $derived(x1 + decayWidth);
  let x4 = $derived(padL + plotW);
  let x3 = $derived(x4 - releaseWidth);
  let sustainWidth = $derived(x3 - x2);

  let yS = $derived(getY(sustain));

  // Non-overlapping label positions for A, D, S, R at the bottom
  let labelPosA = $derived(x0 + Math.max(14, attackWidth / 2));
  let labelPosD = $derived(Math.max(labelPosA + 32, x1 + Math.max(14, decayWidth / 2)));
  let labelPosR = $derived(x4 - Math.max(14, releaseWidth / 2));
  let labelPosS = $derived(Math.min(labelPosR - 32, Math.max(labelPosD + 32, x2 + sustainWidth / 2)));

  // --- SVG Paths ---
  let curvePath = $derived.by(() => {
    let d = `M ${x0} ${y0} L ${x1} ${y1} `;

    if (decayWidth > 0.5) {
      // Exact exponential decay curve to sustain level
      const decaySteps = 24;
      for (let i = 1; i <= decaySteps; i++) {
        const u = i / decaySteps;
        const norm = (Math.exp(-3 * u) - Math.exp(-3)) / (1 - Math.exp(-3));
        const lev = sustain + (1 - sustain) * norm;
        const x = x1 + u * decayWidth;
        const y = getY(lev);
        d += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    } else {
      // Instant vertical drop to sustain level at 0ms
      d += `L ${x1.toFixed(1)} ${yS.toFixed(1)} `;
    }

    // Sustain plateau
    d += `L ${x3.toFixed(1)} ${yS.toFixed(1)} `;

    if (releaseWidth > 0.5) {
      // Exact exponential release curve down to zero
      const relSteps = 24;
      for (let i = 1; i <= relSteps; i++) {
        const u = i / relSteps;
        const norm = (Math.exp(-3 * u) - Math.exp(-3)) / (1 - Math.exp(-3));
        const lev = sustain * norm;
        const x = x3 + u * releaseWidth;
        const y = getY(lev);
        d += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    } else {
      // Instant vertical drop to zero at 0ms
      d += `L ${x3.toFixed(1)} ${y0.toFixed(1)} `;
    }

    return d;
  });

  let areaPath = $derived(`${curvePath} L ${x4} ${y0} L ${x0} ${y0} Z`);

  // --- Animation and Tracking State ---
  type Phase = "idle" | "attack" | "decay" | "sustain" | "release";

  let activePhase = $state<Phase>("idle");
  let currentLevel = $state(0);
  let cursorX = $state(padL);
  let cursorY = $state(y0);

  let animFrameId: number | null = null;
  let resetTimeoutId: number | null = null;
  let phaseStartTime = 0;
  let releaseStartLevel = 0;
  let releaseStartX = padL;

  function formatTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
  }

  function startAnimation() {
    function step(now: number) {
      animFrameId = requestAnimationFrame(step);

      if (activePhase === "attack") {
        if (attack <= 0) {
          activePhase = decay <= 0 ? "sustain" : "decay";
          phaseStartTime = now;
          currentLevel = decay <= 0 ? sustain : 1.0;
          cursorX = x1;
          cursorY = getY(currentLevel);
        } else {
          const elapsed = now - phaseStartTime;
          const progress = Math.min(1, elapsed / attack);

          currentLevel = progress;
          cursorX = x0 + progress * attackWidth;
          cursorY = getY(currentLevel);

          if (progress >= 1) {
            activePhase = decay <= 0 ? "sustain" : "decay";
            phaseStartTime = now;
          }
        }
      } else if (activePhase === "decay") {
        if (decay <= 0) {
          activePhase = "sustain";
          currentLevel = sustain;
          cursorX = x2;
          cursorY = yS;
        } else {
          const elapsed = now - phaseStartTime;
          const progress = Math.min(1, elapsed / decay);

          const decayNorm = (Math.exp(-3 * progress) - Math.exp(-3)) / (1 - Math.exp(-3));
          currentLevel = sustain + (1 - sustain) * decayNorm;
          cursorX = x1 + progress * decayWidth;
          cursorY = getY(currentLevel);

          if (progress >= 1) {
            activePhase = "sustain";
          }
        }
      } else if (activePhase === "sustain") {
        currentLevel = sustain;
        cursorY = getY(sustain);
      } else if (activePhase === "release") {
        if (release <= 0) {
          cursorX = x4;
          cursorY = y0;
          currentLevel = 0;
          activePhase = "idle";
          if (animFrameId !== null) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }

          resetTimeoutId = window.setTimeout(() => {
            if (activePhase === "idle" && !gate) {
              cursorX = x0;
              cursorY = y0;
            }
          }, 350);
        } else {
          const elapsed = now - phaseStartTime;
          const progress = Math.min(1, elapsed / release);

          const releaseNorm = (Math.exp(-3 * progress) - Math.exp(-3)) / (1 - Math.exp(-3));
          currentLevel = releaseStartLevel * releaseNorm;

          cursorX = releaseStartX + progress * (x4 - releaseStartX);
          cursorY = getY(currentLevel);

          if (progress >= 1) {
            cursorX = x4;
            cursorY = y0;
            currentLevel = 0;
            activePhase = "idle";
            if (animFrameId !== null) {
              cancelAnimationFrame(animFrameId);
              animFrameId = null;
            }

            // Return cursor to start after a brief pause so completion is visible
            resetTimeoutId = window.setTimeout(() => {
              if (activePhase === "idle" && !gate) {
                cursorX = x0;
                cursorY = y0;
              }
            }, 350);
          }
        }
      }
    }

    animFrameId = requestAnimationFrame(step);
  }

  function handleGateOn() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (resetTimeoutId !== null) {
      clearTimeout(resetTimeoutId);
      resetTimeoutId = null;
    }

    phaseStartTime = performance.now();

    if (attack <= 0 && decay <= 0) {
      activePhase = "sustain";
      currentLevel = sustain;
      cursorX = x2;
      cursorY = yS;
    } else if (attack <= 0) {
      activePhase = "decay";
      currentLevel = 1.0;
      cursorX = x1;
      cursorY = y1;
    } else {
      activePhase = "attack";
      cursorX = x0;
      cursorY = y0;
      currentLevel = 0;
    }

    startAnimation();
  }

  function handleGateOff() {
    if (activePhase === "idle") return;

    if (resetTimeoutId !== null) {
      clearTimeout(resetTimeoutId);
      resetTimeoutId = null;
    }

    // Always jump to the release part of the graph (x3, yS) regardless of which phase gate was released in
    releaseStartX = x3;
    cursorX = x3;
    releaseStartLevel = sustain > 0 ? sustain : currentLevel;
    cursorY = getY(releaseStartLevel);

    if (release <= 0) {
      cursorX = x4;
      cursorY = y0;
      currentLevel = 0;
      activePhase = "idle";
      resetTimeoutId = window.setTimeout(() => {
        if (activePhase === "idle" && !gate) {
          cursorX = x0;
          cursorY = y0;
        }
      }, 350);
      return;
    }

    activePhase = "release";
    phaseStartTime = performance.now();

    if (animFrameId === null) {
      startAnimation();
    }
  }

  // --- Gate Reactivity ---
  let prevGate = $state(false);

  $effect(() => {
    const currentGate = gate;
    if (currentGate && !prevGate) {
      handleGateOn();
    } else if (!currentGate && prevGate) {
      handleGateOff();
    }
    prevGate = currentGate;
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (resetTimeoutId !== null) {
        clearTimeout(resetTimeoutId);
        resetTimeoutId = null;
      }
    };
  });
</script>

<div
  class="flex flex-col gap-3 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm w-full select-none {className}"
  role="region"
  aria-label="ADSR Envelope Visualizer"
  onpointerdown={() => {
    if (interactive) gate = true;
  }}
  onpointerup={() => {
    if (interactive) gate = false;
  }}
  onpointerleave={() => {
    if (interactive && gate) gate = false;
  }}
>
  <!-- Header Bar -->
  <div class="flex items-center justify-between border-b border-base-200 pb-2">
    <div class="flex items-center gap-3">
      <span class="text-[11px] font-black uppercase tracking-widest text-base-content/50">
        ADSR Envelope
      </span>
      {#if activePhase === "idle"}
        <span class="badge badge-neutral badge-xs font-mono tracking-wider">IDLE</span>
      {:else if activePhase === "attack"}
        <span class="badge badge-primary badge-xs font-mono tracking-wider animate-pulse">ATTACK</span>
      {:else if activePhase === "decay"}
        <span class="badge badge-warning badge-xs font-mono tracking-wider animate-pulse">DECAY</span>
      {:else if activePhase === "sustain"}
        <span class="badge badge-secondary badge-xs font-mono tracking-wider animate-pulse">
          {gate ? "SUSTAIN (HELD)" : "SUSTAIN"}
        </span>
      {:else if activePhase === "release"}
        <span class="badge badge-info badge-xs font-mono tracking-wider animate-pulse">RELEASE</span>
      {/if}
    </div>

    <!-- Live Level Readout -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-mono text-base-content/70">
        Level: {(currentLevel * 100).toFixed(0)}%
      </span>
      <div class="w-16 h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary"
          style="width: {Math.min(100, Math.max(0, currentLevel * 100))}%"
        ></div>
      </div>
    </div>
  </div>

  <!-- Stage Cards -->
  {#if showStageCards}
    <div class="grid grid-cols-4 gap-2 text-center">
      <div
        class="p-2 rounded-lg border transition-all {activePhase === 'attack'
          ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
          : 'bg-base-200/50 border-base-200 text-base-content/70'}"
      >
        <div class="text-[10px] uppercase tracking-wider font-semibold">Attack</div>
        <div class="text-xs font-mono">{formatTime(attack)}</div>
      </div>

      <div
        class="p-2 rounded-lg border transition-all {activePhase === 'decay'
          ? 'bg-warning/10 border-warning text-warning font-bold shadow-sm'
          : 'bg-base-200/50 border-base-200 text-base-content/70'}"
      >
        <div class="text-[10px] uppercase tracking-wider font-semibold">Decay</div>
        <div class="text-xs font-mono">{formatTime(decay)}</div>
      </div>

      <div
        class="p-2 rounded-lg border transition-all {activePhase === 'sustain'
          ? 'bg-secondary/10 border-secondary text-secondary font-bold shadow-sm'
          : 'bg-base-200/50 border-base-200 text-base-content/70'}"
      >
        <div class="text-[10px] uppercase tracking-wider font-semibold">Sustain</div>
        <div class="text-xs font-mono">{(sustain * 100).toFixed(0)}%</div>
      </div>

      <div
        class="p-2 rounded-lg border transition-all {activePhase === 'release'
          ? 'bg-info/10 border-info text-info font-bold shadow-sm'
          : 'bg-base-200/50 border-base-200 text-base-content/70'}"
      >
        <div class="text-[10px] uppercase tracking-wider font-semibold">Release</div>
        <div class="text-xs font-mono">{formatTime(release)}</div>
      </div>
    </div>
  {/if}

  <!-- SVG ADSR Graph -->
  <div class="w-full relative">
    <svg
      viewBox="0 0 {width} {height}"
      class="w-full h-auto overflow-visible"
    >
      <defs>
        <!-- Gradient fill under envelope curve -->
        <linearGradient id="adsrGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary-val, #1fb0a8)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--color-primary-val, #1fb0a8)" stop-opacity="0.02" />
        </linearGradient>

        <linearGradient id="playheadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-secondary-val, #e87953)" stop-opacity="0.9" />
          <stop offset="100%" stop-color="var(--color-secondary-val, #e87953)" stop-opacity="0.3" />
        </linearGradient>

        <!-- Clip path for the sustain capsule -->
        <clipPath id="sustainClip">
          <rect
            x={x2}
            y={yS - 6}
            width={sustainWidth}
            height="12"
            rx="6"
          />
        </clipPath>

        <!-- Edge fade gradient for soft entry/exit of stripes -->
        <linearGradient id="sustainEdgeFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="14%" stop-color="white" stop-opacity="1" />
          <stop offset="86%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>

        <mask id="sustainMask">
          <rect
            x={x2}
            y={yS - 6}
            width={sustainWidth}
            height="12"
            rx="6"
            fill="url(#sustainEdgeFade)"
          />
        </mask>

        <!-- Filter to give the diagonal lines a soft, blurry border spatially -->
        <filter id="stripeBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        <!-- Moving diagonal stripes pattern for sustain animation (thicker lines) -->
        <pattern id="sustainStripes" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M -5,5 l 10,-10 M 0,20 l 20,-20 M 15,25 l 10,-10"
            stroke="rgba(255, 255, 255, 0.85)"
            stroke-width="5.5"
            stroke-linecap="square"
          />
          <animateTransform
            attributeName="patternTransform"
            type="translate"
            from="0 0"
            to="20 0"
            dur="0.85s"
            repeatCount="indefinite"
          />
        </pattern>
      </defs>

      <!-- Phase Column Highlights -->
      {#if activePhase === "attack"}
        <rect x={x0} y={padT} width={attackWidth} height={plotH} fill="var(--color-primary-val, #1fb0a8)" opacity="0.07" rx="4" />
      {:else if activePhase === "decay"}
        <rect x={x1} y={padT} width={decayWidth} height={plotH} fill="var(--color-primary-val, #1fb0a8)" opacity="0.07" rx="4" />
      {:else if activePhase === "sustain"}
        <rect x={x2} y={padT} width={sustainWidth} height={plotH} fill="var(--color-secondary-val, #e87953)" opacity="0.09" rx="4" />
      {:else if activePhase === "release"}
        <rect x={x3} y={padT} width={releaseWidth} height={plotH} fill="var(--color-primary-val, #1fb0a8)" opacity="0.07" rx="4" />
      {/if}

      <!-- Horizontal Grid Lines -->
      <line x1={x0} y1={y1} x2={x4} y2={y1} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1" stroke-dasharray="3 3" opacity="0.35" />
      <text x={x0 - 8} y={y1 + 4} text-anchor="end" class="text-[11px] fill-base-content/40 font-mono">1.0</text>

      <line x1={x0} y1={getY(0.5)} x2={x4} y2={getY(0.5)} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1" stroke-dasharray="3 3" opacity="0.25" />
      <text x={x0 - 8} y={getY(0.5) + 4} text-anchor="end" class="text-[11px] fill-base-content/40 font-mono">0.5</text>

      <line x1={x0} y1={y0} x2={x4} y2={y0} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1.5" opacity="0.6" />
      <text x={x0 - 8} y={y0 + 4} text-anchor="end" class="text-[11px] fill-base-content/40 font-mono">0.0</text>

      <!-- Sustain Level Guide -->
      {#if sustain > 0.02 && sustain < 0.98}
        <line
          x1={x0}
          y1={yS}
          x2={x4}
          y2={yS}
          stroke="var(--color-secondary-val, #e87953)"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.35"
        />
        <text
          x={x4 + 6}
          y={yS + 4}
          text-anchor="start"
          class="text-[10px] fill-base-content/40 font-mono"
        >
          S
        </text>
      {/if}

      <!-- Vertical Phase Boundaries -->
      <line x1={x1} y1={padT} x2={x1} y2={y0} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1" stroke-dasharray="2 3" opacity="0.4" />
      <line x1={x2} y1={padT} x2={x2} y2={y0} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1" stroke-dasharray="2 3" opacity="0.4" />
      <line x1={x3} y1={padT} x2={x3} y2={y0} stroke="var(--color-grid-val, #cbd5e1)" stroke-width="1" stroke-dasharray="2 3" opacity="0.4" />

      <!-- Area Under Curve -->
      <path d={areaPath} fill="url(#adsrGradient)" />

      <!-- Main Envelope Curve -->
      <path
        d={curvePath}
        fill="none"
        stroke="var(--color-primary-val, #1fb0a8)"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Key Nodes on the Curve -->
      <circle cx={x1} cy={y1} r="4" fill="var(--color-primary-val, #1fb0a8)" stroke="var(--color-surface-val, #fff)" stroke-width="2" />
      <circle cx={x2} cy={yS} r="4" fill="var(--color-primary-val, #1fb0a8)" stroke="var(--color-surface-val, #fff)" stroke-width="2" />
      <circle cx={x3} cy={yS} r="4" fill="var(--color-primary-val, #1fb0a8)" stroke="var(--color-surface-val, #fff)" stroke-width="2" />

      <!-- Phase Labels (Bottom) -->
      <text x={labelPosA} y={y0 + 20} text-anchor="middle" class="text-[11px] font-bold fill-base-content/60 tracking-wider">A</text>
      <text x={labelPosD} y={y0 + 20} text-anchor="middle" class="text-[11px] font-bold fill-base-content/60 tracking-wider">D</text>
      <text x={labelPosS} y={y0 + 20} text-anchor="middle" class="text-[11px] font-bold fill-base-content/60 tracking-wider">S</text>
      <text x={labelPosR} y={y0 + 20} text-anchor="middle" class="text-[11px] font-bold fill-base-content/60 tracking-wider">R</text>

      <text x={labelPosA} y={y0 + 34} text-anchor="middle" class="text-[9px] font-mono fill-base-content/40">{formatTime(attack)}</text>
      <text x={labelPosD} y={y0 + 34} text-anchor="middle" class="text-[9px] font-mono fill-base-content/40">{formatTime(decay)}</text>
      <text x={labelPosS} y={y0 + 34} text-anchor="middle" class="text-[9px] font-mono fill-base-content/40">{(sustain * 100).toFixed(0)}%</text>
      <text x={labelPosR} y={y0 + 34} text-anchor="middle" class="text-[9px] font-mono fill-base-content/40">{formatTime(release)}</text>

      <!-- Gate Off Marker Label -->
      <text x={Math.min(x4 - 24, Math.max(x2 + 24, x3))} y={padT - 12} text-anchor="middle" class="text-[9px] font-mono uppercase tracking-wider fill-base-content/40">
        Gate Off
      </text>

      <!-- Playhead & Cursor (Dot for Attack/Decay/Release, Line for Sustain) -->
      {#if activePhase === "sustain"}
        <!-- Sustain vertical boundary markers -->
        <line
          x1={x2}
          y1={padT - 6}
          x2={x2}
          y2={y0}
          stroke="url(#playheadGrad)"
          stroke-width="1.5"
          stroke-dasharray="3 3"
          opacity="0.8"
        />
        <line
          x1={x3}
          y1={padT - 6}
          x2={x3}
          y2={y0}
          stroke="url(#playheadGrad)"
          stroke-width="1.5"
          stroke-dasharray="3 3"
          opacity="0.8"
        />

        <!-- Sustain Capsule: single line the thickness of the dot with animated diagonal stripes moving right -->
        <g>
          <animate attributeName="opacity" from="0" to="1" dur="0.25s" fill="freeze" />
          <rect
            x={x2}
            y={yS - 6}
            width={sustainWidth}
            height="12"
            rx="6"
            fill="var(--color-secondary-val, #e87953)"
            stroke="var(--color-surface-val, #ffffff)"
            stroke-width="2"
          />
          <g clip-path="url(#sustainClip)" mask="url(#sustainMask)">
            <rect
              x={x2}
              y={yS - 6}
              width={sustainWidth}
              height="12"
              fill="url(#sustainStripes)"
              filter="url(#stripeBlur)"
              opacity="0.7"
            />
          </g>
        </g>
      {:else}
        <!-- Active Vertical Line (Playhead) -->
        <line
          x1={cursorX}
          y1={padT - 6}
          x2={cursorX}
          y2={y0}
          stroke="url(#playheadGrad)"
          stroke-width={activePhase === "idle" ? "1.5" : "2.5"}
          stroke-dasharray={activePhase === "idle" ? "3 3" : undefined}
          opacity={activePhase === "idle" ? "0.3" : "1"}
        />

        <!-- Cursor Dot -->
        <circle
          cx={cursorX}
          cy={cursorY}
          r={activePhase === "idle" ? "4" : "6"}
          fill="var(--color-secondary-val, #e87953)"
          stroke="var(--color-surface-val, #ffffff)"
          stroke-width="2"
        />
      {/if}
    </svg>
  </div>
</div>
