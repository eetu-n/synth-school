import("stdfaust.lib");

alisaw = ( os.lf_sawpos(440) * 2 ) - 1;

antisaw = os.sawN(3, 440);

aliGate = button("gate1") : si.smoo;
antiGate = button("gate2") : si.smoo;

saw1 = alisaw * aliGate * 0.3;
saw2 = antisaw * antiGate * 0.3;

process = saw2 + saw1 <: _, _;
