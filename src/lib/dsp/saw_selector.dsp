import("stdfaust.lib");

alisaw = ( os.lf_sawpos(440) * 2 ) - 1;

antisaw = os.sawN(3, 440);

gate = button("Gate") : si.smoo;

saw1 = alisaw * gate * 0.3;
saw2 = antisaw * gate * 0.3;

s = checkbox("Aliasing");

process = saw2, saw1 : select2(s) <: _, _;