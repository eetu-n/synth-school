import("stdfaust.lib");
melodies = library("melodies.lib");
mel = library("melodyPlayer.lib");

tempo = hslider("Tempo", 100, 40, 240, 1);

trig_saw = button("Sawtooth");
trig_sq  = button("Square");
trig_tri = button("Triangle");
trig_sin = button("Sine");

process = mel.melody_player(trig_saw, os.polyblep_saw, melodies.lick_notes, melodies.lick_lengths, tempo)
        + mel.melody_player(trig_sq,  os.square,       melodies.lick_notes, melodies.lick_lengths, tempo)
        + mel.melody_player(trig_tri, os.triangle,     melodies.lick_notes, melodies.lick_lengths, tempo)
        + mel.melody_player(trig_sin, os.osc,          melodies.lick_notes, melodies.lick_lengths, tempo)
        <: _, _;
