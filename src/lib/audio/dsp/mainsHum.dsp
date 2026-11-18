import("stdfaust.lib");

gate = button("gate");

process = (no.sparse_noise(2) * 0.5 + os.square(50) * 0.1 )* gate  <: _, _ ;