import("stdfaust.lib");

waveSelect = nentry("Waveform [style:menu{'Saw':0; 'Square':1; 'Triangle':2}]", 0, 0, 2, 1);

oscillator(freq) = select3(waveSelect, 
    os.sawtooth(freq), 
    os.square(freq), 
    os.triangle(freq)
);

// --- Filter ---
cutoff = hslider("Cutoff [unit:Hz][scale:log]", 2000, 20, 20000, 1) : si.smoo;
res = hslider("Resonance", 0.5, 0.5, 10, 0.01) : si.smoo;

filter = fi.resonlp(cutoff, res, 0.5);

// --- Envelope Section ---
// ADSR mapped to gain
gate = button("gate");
a = hslider("Attack [unit:ms]", 1, 0, 5000, 0.1) * 0.001;
d = hslider("Decay [unit:ms]", 1, 0, 5000, 0.1) * 0.001;
s = hslider("Sustain", 0.7, 0, 1, 0.01);
r = hslider("Release [unit:ms]", 0.3, 0, 5000, 0.1) * 0.001;

envelope = en.adsr(a, d, s, r, gate);

// --- Global Controls ---
freq = hslider("freq [unit:Hz][scale:log]", 440, 20, 10000, 1);
gain = hslider("gain", 0.5, 0, 1, 0.01);

// --- Assembly ---
process = oscillator(freq) 
          : filter 
          : *(envelope) 
          : *(gain) 
          <: _, _;
