import("stdfaust.lib");

// --- Controls ---
f = hslider("freq", 220, 50, 2000, 0.01);
n_max = 100;
n_end = hslider("harmonics_end", 1, 1, n_max, 1) : si.smoo;
wave_type = nentry("wave_type", 0, 0, 2, 1); 
gate = checkbox("gate") : si.smoo;

// All harmonics for saw, odd for square and triangle
is_allowed(n) = (wave_type == 0) + (n % 2 != 0) > 0;

// Amplitude scaling: Triangle is 1/n^2, others are 1/n
get_amp(n) = (wave_type == 2) * (1.0 / (n * n)) 
           + (wave_type < 2) * (1.0 / n);

saw_phase(n) = (((n-1) % 2) * -2) + 1;
triangle_phase(n) = (((n-1)/2) % 2) * -2 + 1;

get_phase(n) = (wave_type == 0) * saw_phase(n)
             + (wave_type == 1) * 1.0
             + (wave_type == 2) * triangle_phase(n);

// --- Generation ---
phase = os.phasor(1.0, f);

harmonic(n) = sin(2.0 * ma.PI * float(n) * phase) * multiplier
with {
    multiplier = (n <= n_end) * is_allowed(n) * get_amp(n) * get_phase(n);
};

additive_synth = sum(i, n_max, harmonic(i + 1));

// Output stage
process = additive_synth * 0.4 * gate <: _, _;
