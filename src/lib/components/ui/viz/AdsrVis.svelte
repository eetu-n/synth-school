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

  // --- Configuration & Timing ---
  /** Duration (in ms) to stretch the cursor ball into the sustain bar on entry (~3-6 frames) */
  const SUSTAIN_STRETCH_DURATION_MS = 100;
  /** Duration (in ms) to collapse the sustain bar back into the cursor ball on release (~3-6 frames) */
  const SUSTAIN_COLLAPSE_DURATION_MS = 75;

  // --- Visualizer Dimensions ---
  const width = 800;
  const height = 220;
  const padL = 16;
  const padR = 16;
  const padT = 20;
  const padB = 8;

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
  let sustainProgress = $state(1);
  let isCollapsingFromSustain = $state(false);
  let collapseProgress = $state(0);

  let animFrameId: number | null = null;
  let resetTimeoutId: number | null = null;
  let phaseStartTime = 0;
  let sustainStartTime = 0;
  let collapseStartTime = 0;
  let releaseStartLevel = 0;
  let releaseStartX = padL;

  // Capsule geometry (stretches from circle of r=9 at (x2, yS) on entry, collapses into circle at (x3, yS) on release)
  let stretchT = $derived(1 - Math.pow(1 - sustainProgress, 2));
  let collapseT = $derived(1 - Math.pow(1 - collapseProgress, 2));

  let capsuleLeft = $derived.by(() => {
    if (isCollapsingFromSustain) {
      return x2 + collapseT * (x3 - 9 - x2);
    }
    return (x2 - 9) + stretchT * 9;
  });

  let capsuleRight = $derived.by(() => {
    if (isCollapsingFromSustain) {
      return x3 + collapseT * 9;
    }
    return (x2 + 9) + stretchT * (x3 - (x2 + 9));
  });

  let capsuleW = $derived(Math.max(18, capsuleRight - capsuleLeft));

  let capsuleH = $derived.by(() => {
    if (isCollapsingFromSustain) {
      return 12 + collapseT * 6;
    }
    return 18 - stretchT * 6;
  });

  let capsuleY = $derived(yS - capsuleH / 2);
  let capsuleRx = $derived(capsuleH / 2);

  let stripesOpacity = $derived.by(() => {
    if (isCollapsingFromSustain) {
      return (1 - collapseProgress) * 0.7;
    }
    return sustainProgress * 0.7;
  });

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
          if (decay <= 0) {
            sustainStartTime = now;
            sustainProgress = 0;
          }
        } else {
          const elapsed = now - phaseStartTime;
          const progress = Math.min(1, elapsed / attack);

          currentLevel = progress;
          cursorX = x0 + progress * attackWidth;
          cursorY = getY(currentLevel);

          if (progress >= 1) {
            activePhase = decay <= 0 ? "sustain" : "decay";
            phaseStartTime = now;
            if (decay <= 0) {
              sustainStartTime = now;
              sustainProgress = 0;
            }
          }
        }
      } else if (activePhase === "decay") {
        if (decay <= 0) {
          activePhase = "sustain";
          currentLevel = sustain;
          cursorX = x2;
          cursorY = yS;
          sustainStartTime = now;
          sustainProgress = 0;
        } else {
          const elapsed = now - phaseStartTime;
          const progress = Math.min(1, elapsed / decay);

          const decayNorm = (Math.exp(-3 * progress) - Math.exp(-3)) / (1 - Math.exp(-3));
          currentLevel = sustain + (1 - sustain) * decayNorm;
          cursorX = x1 + progress * decayWidth;
          cursorY = getY(currentLevel);

          if (progress >= 1) {
            activePhase = "sustain";
            sustainStartTime = now;
            sustainProgress = 0;
          }
        }
      } else if (activePhase === "sustain") {
        currentLevel = sustain;
        cursorY = getY(sustain);
        if (sustainProgress < 1) {
          const elapsed = now - sustainStartTime;
          sustainProgress =
            SUSTAIN_STRETCH_DURATION_MS > 0
              ? Math.min(1, elapsed / SUSTAIN_STRETCH_DURATION_MS)
              : 1;
        }
      } else if (activePhase === "release") {
        if (isCollapsingFromSustain) {
          const collapseElapsed = now - collapseStartTime;
          collapseProgress =
            SUSTAIN_COLLAPSE_DURATION_MS > 0
              ? Math.min(1, collapseElapsed / SUSTAIN_COLLAPSE_DURATION_MS)
              : 1;
          currentLevel = sustain;
          cursorX = x3;
          cursorY = yS;

          if (collapseProgress >= 1) {
            isCollapsingFromSustain = false;
            sustainProgress = 1;
            phaseStartTime = now;

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
              return;
            }
          }
        } else {
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

    isCollapsingFromSustain = false;
    collapseProgress = 0;
    phaseStartTime = performance.now();

    if (attack <= 0 && decay <= 0) {
      activePhase = "sustain";
      sustainStartTime = performance.now();
      sustainProgress = 0;
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

    const wasInSustain = activePhase === "sustain";

    // Setup release coordinates
    releaseStartX = x3;
    cursorX = x3;
    releaseStartLevel = sustain > 0 ? sustain : currentLevel;
    cursorY = getY(releaseStartLevel);

    activePhase = "release";
    phaseStartTime = performance.now();

    if (wasInSustain && SUSTAIN_COLLAPSE_DURATION_MS > 0) {
      isCollapsingFromSustain = true;
      collapseStartTime = performance.now();
      collapseProgress = 0;
    } else {
      isCollapsingFromSustain = false;
      collapseProgress = 1;
      sustainProgress = 1;

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
    }

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
          <stop offset="0%" stop-color="var(--color-primary, #1fb0a8)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--color-primary, #1fb0a8)" stop-opacity="0.02" />
        </linearGradient>

        <linearGradient id="playheadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-secondary, #e87953)" stop-opacity="0.9" />
          <stop offset="100%" stop-color="var(--color-secondary, #e87953)" stop-opacity="0.3" />
        </linearGradient>

        <!-- Clip path for the sustain capsule -->
        <clipPath id="sustainClip">
          <rect
            x={capsuleLeft}
            y={capsuleY}
            width={capsuleW}
            height={capsuleH}
            rx={capsuleRx}
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
            x={capsuleLeft}
            y={capsuleY}
            width={capsuleW}
            height={capsuleH}
            rx={capsuleRx}
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

      <!-- Baseline -->
      <line x1={x0} y1={y0} x2={x4} y2={y0} stroke="var(--color-grid, #cbd5e1)" stroke-width="1" opacity="0.5" />

      <!-- 1.0 grid line -->
      <line x1={x0} y1={y1} x2={x4} y2={y1} stroke="var(--color-grid, #cbd5e1)" stroke-width="1" stroke-dasharray="3 3" opacity="0.25" />

      <!-- Area Under Curve -->
      <path d={areaPath} fill="url(#adsrGradient)" />

      <!-- Main Envelope Curve -->
      <path
        d={curvePath}
        fill="none"
        stroke="var(--color-primary, #1fb0a8)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />


      <!-- Playhead & Cursor (Dot for Attack/Decay/Release, Capsule for Sustain / Collapse) -->
      {#if activePhase === "sustain" || isCollapsingFromSustain}
        <!-- Sustain Capsule (stretches from cursor dot into full bar, collapses on release) -->
        <g>
          <rect
            x={capsuleLeft}
            y={capsuleY}
            width={capsuleW}
            height={capsuleH}
            rx={capsuleRx}
            fill="var(--color-secondary, #e87953)"
            stroke="var(--color-surface, #ffffff)"
            stroke-width="2"
          />
          <g clip-path="url(#sustainClip)" mask="url(#sustainMask)">
            <rect
              x={capsuleLeft}
              y={capsuleY}
              width={capsuleW}
              height={capsuleH}
              fill="url(#sustainStripes)"
              filter="url(#stripeBlur)"
              opacity={stripesOpacity}
            />
          </g>
        </g>
      {:else if activePhase !== "idle"}
        <!-- Active Playhead line -->
        <line
          x1={cursorX}
          y1={padT}
          x2={cursorX}
          y2={y0}
          stroke="url(#playheadGrad)"
          stroke-width="2"
          opacity="0.5"
        />
        <!-- Cursor Dot -->
        <circle
          cx={cursorX}
          cy={cursorY}
          r="9"
          fill="var(--color-secondary, #e87953)"
          stroke="var(--color-surface, #ffffff)"
          stroke-width="2"
        />
      {/if}
    </svg>
  </div>
</div>
