import("stdfaust.lib");
import("basics.lib");

declare options "[midi:on][nvoices:12]";

freq = hslider("key",60,21,127,1) : midikey2hz;
gain = hslider("gain",0.5,0,1,0.01);
gate = button("gate");
envelope = en.adsr(0.01,0.01,0.8,0.1,gate)*gain;
process = os.square(freq)*envelope <: _, _;