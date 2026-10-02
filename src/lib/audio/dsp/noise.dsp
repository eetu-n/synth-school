import("stdfaust.lib");

play = button("play") * 0.5 : si.smoo;

process = no.noise * play <: _, _;
