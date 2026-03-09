import("stdfaust.lib");
m = library("midi.dsp");
declare options "[midi:on][nvoices:12]";

alisaw = ( os.lf_sawpos(m.freq) * 2 ) - 1;

antisaw = os.sawN(3, m.freq);

saw1 = alisaw * m.envelope;
saw2 = antisaw * m.envelope;

s = checkbox("Aliasing");

process = saw2, saw1 : select2(s) <: _, _;