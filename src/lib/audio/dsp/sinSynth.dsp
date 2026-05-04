import("stdfaust.lib");

freq = hslider("frequency", 500, 1, 4000, 1);

play = button("play") * 0.5 : si.smoo;

process = os.osc(freq) * play <: _, _;