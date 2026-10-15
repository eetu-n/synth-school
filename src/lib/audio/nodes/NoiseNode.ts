import FaustNode from "$lib/audio/framework/FaustNode";
import type { FaustAudioWorkletNode } from "@grame/faustwasm/dist/esm/index.js";

export default class NoiseNode extends FaustNode {
  private playing: boolean = false;

  protected constructor(name: string, context: AudioContext, workletNode: FaustAudioWorkletNode) {
    super(name, context, workletNode);
  }

  static async create(name: string = "noise", context: AudioContext): Promise<NoiseNode | null> {
    const worklet = await FaustNode.createWorkletNode("noise", context);
    if (!worklet) return null;
    return new NoiseNode(name, context, worklet);
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    this.setParamValue("play", playing ? 1 : 0);
  }

  getPlaying(): boolean {
    return this.playing;
  }
}
