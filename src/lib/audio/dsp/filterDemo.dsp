import("stdfaust.lib");

cutoff = hslider("cutoffFreq", 500, 1, 20000, 1) : si.smoo;
filtSelect = hslider("filtSelect", 0, 0, 2, 1);

filter(c) = _ <: (
    fi.lowpass(3, c),
    fi.highpass(3, c),
    fi.bandpass(3, max(250, c) - (max(250, c) * 0.5), min(20000, max(250, c) + (max(250, c) * 0.5)))
) : select3(filtSelect);

play = button("play") * 0.5 : si.smoo;

process = no.noise * play : filter(cutoff) <: _, _;
