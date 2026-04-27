import("stdfaust.lib");

f0 = 220;
n_max = 100;

n_end = hslider("harmonics_end", 1, 1, n_max, 1);
wave_type = nentry("wave_type", 0, 0, 2, 1); // 0=saw, 1=square, 2=triangle
gate = checkbox("gate") : si.smoo;

// All harmonics for saw (0), only odd for square (1) and triangle (2)
harmonic_allowed(n) = (wave_type == 0) + (n % 2 == 1) > 0;

// Phase sync
phase = os.phasor(1.0, f0);

// Amplitude logic: Triangle is 1/n^2, others are 1/n
amp(n) = (wave_type == 2) * tri_amp(n) 
       + (wave_type < 2) * s_amp(n);

tri_amp(n) = 1.0 / (n * n);
s_amp(n) = 1.0 / n;

// Phase logic: 
// Saw (0): alternating (-1)^n
// Square (1): all same (1.0)
// Triangle (2): alternating (-1)^((n-1)/2)
phase_flip(n) = (wave_type == 0) * ((((n-1) % 2) * -2) + 1)
              + (wave_type == 1) * 1.0
              + (wave_type == 2) * (((((n-1)/2) % 2) * -2) + 1);

// Not using os.osc for phase sync
harmonic(n) = sin(2.0 * ma.PI * n * phase) 
             * ((n <= n_end) * harmonic_allowed(n) : si.smoo) 
             * amp(n) 
             * phase_flip(n);

additive_synth = sum(i, n_max, harmonic(i + 1));

process = additive_synth * 0.5 * gate <: _, _;
