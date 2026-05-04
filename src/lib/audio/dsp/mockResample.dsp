import("stdfaust.lib");

freq = hslider("frequency", 1000, 20, 4000, 1);
targetRate = hslider("sampleRate", 2000, 100, 4000, 1);
gain = checkbox("play") * 0.5;

aliasedFreq(f, sr) = abs( (f + sr/2) % sr - sr/2 );

process = os.osc(aliasedFreq(freq, targetRate)) * gain <: _, _;
