import("stdfaust.lib");

freq = 500;

alisaw = ( os.lf_sawpos(freq) * 2 ) - 1;

antisaw = os.sawN(3, freq);

saw1 = alisaw * 0.5;
saw2 = antisaw * 0.5;

s = checkbox("Aliasing");

mute = checkbox("Mute");

process = saw2, saw1 : select2(s) * mute <: _, _;