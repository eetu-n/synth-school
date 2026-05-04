import("stdfaust.lib");

freq = hslider("Input Frequency [Hz]", 1000, 20, 2000, 1);
targetRate = hslider("Target Rate [Hz]", 2000, 100, 4000, 1);


reconstruction(rate) = fi.lowpass6e(cutoff)
with {
    cutoff = rate * 0.45; 
};

process = os.osc(freq) * 0.5 
          : ba.downSample(targetRate)
          : reconstruction(targetRate)
          <: _, _;
