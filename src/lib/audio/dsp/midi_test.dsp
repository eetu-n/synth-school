import("stdfaust.lib");
m = library("midi.dsp");
declare options "[midi:on][nvoices:12]";

process = os.square(m.freq) * m.envelope <: _, _;