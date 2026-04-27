import("stdfaust.lib");

// --- Controls ---
f = hslider("freq", 220, 50, 2000, 0.01);
n_max = 100;
n_end = hslider("harmonics_end", 1, 1, n_max, 1) : si.smoo;
wave_type = nentry("wave_type", 0, 0, 2, 1); 
gate = checkbox("gate") : si.smoo;

// All harmonics for saw, odd for square and triangle
is_allowed(n) = ba.if(
    wave_type == 0, 1.0,
    float(n % 2 != 0)
);

// Amplitude scaling
get_amp(n) = ba.if(
    wave_type == 2, 1.0 / float(n * n),
    1.0 / float(n)
);

// Phase
get_phase(n) = ba.ifNc(
    wave_type == 0, saw_phase(n),
    wave_type == 1, 1.0,
    triangle_phase(n)
);

saw_phase(n) = (((n-1) % 2) * -2) + 1;
triangle_phase(n) = (((n-1)/2) % 2) * -2 + 1;

// --- Generation ---
phase = os.phasor(1.0, f);

harmonic(n) = sin(2.0 * ma.PI * float(n) * phase) * multiplier
with {
    multiplier = (float(n) <= n_end) * is_allowed(n) * get_amp(n) * get_phase(n);
};

additive_synth = sum(i, n_max, harmonic(i + 1));

// Output stage
process = additive_synth * 0.9 * gate <: _, _;
