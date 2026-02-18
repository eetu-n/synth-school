import("stdfaust.lib");

process(l,r) = out_l, out_r
with {
    gain = vslider("Master Volume", 0.5, 0.0, 1.0, 0.01);
    mute = checkbox("Mute");
    muted_gain = gain * (1.0 - mute);
    out_l = l * muted_gain;
    out_r = r * muted_gain;
};