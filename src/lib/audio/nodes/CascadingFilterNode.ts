import RoutedAudioNode from "$lib/audio/framework/RoutedAudioNode";
import { FilterResponseAnalyzer } from "$lib/audio/nodes/FilterResponseAnalyzer";

export interface FilterParams {
  cutoff?: number;
  q?: number;
  type?: number | BiquadFilterType;
  slope?: number;
}

export default class CascadingFilterNode extends RoutedAudioNode<BiquadFilterNode> {
  public filterNodes: BiquadFilterNode[];

  private cutoffFreq: number = 500;
  private qValue: number = 1;
  private filtSelect: number = 0; // 0 = LP, 1 = HP, 2 = BP
  private slopeSelect: number = 1; // 1 = 12dB, 2 = 24dB, 4 = 48dB
  private filterAnalyzer: FilterResponseAnalyzer;

  constructor(name: string, context: AudioContext) {
    super(name, context, null);

    this.filterNodes = [
      context.createBiquadFilter(),
      context.createBiquadFilter(),
      context.createBiquadFilter(),
      context.createBiquadFilter()
    ];

    // Chain the 4 biquads in series internally
    for (let i = 0; i < 3; i++) {
      this.filterNodes[i].connect(this.filterNodes[i + 1]);
    }

    this.audioNode = this.filterNodes[0];
    this.filterAnalyzer = new FilterResponseAnalyzer();

    this.updateParams();
  }

  get activeFilter(): BiquadFilterNode {
    const idx = Math.min(this.slopeSelect - 1, this.filterNodes.length - 1);
    return this.filterNodes[Math.max(0, idx)];
  }

  override connectFrom(inputNode: RoutedAudioNode<any>) {
    if (!inputNode.audioNode) {
      console.error(
        "Attempting to connect input node " + inputNode.name + " to output node " + this.name + ", but input has no audioNode"
      );
      return;
    }
    inputNode.audioNode.connect(this.filterNodes[0]);
    console.log("Connected " + inputNode.name + " to " + this.name);
  }

  override disconnectFrom(inputNode: RoutedAudioNode<any>) {
    if (inputNode.audioNode) {
      try {
        inputNode.audioNode.disconnect(this.filterNodes[0]);
      } catch (e) {
        // Ignore DOMException if already disconnected
      }
    }
  }

  setParams(params: FilterParams) {
    if (params.slope !== undefined && params.slope !== this.slopeSelect) {
      const outputs = [...this.getOutputs()];
      // Disconnect current outputs from the old active filter
      outputs.forEach(output => {
        output.disconnectFrom(this);
      });

      this.slopeSelect = params.slope;
      this.audioNode = this.activeFilter;

      // Reconnect outputs to the new active filter
      outputs.forEach(output => {
        output.connectFrom(this);
      });
    }

    if (params.cutoff !== undefined) this.cutoffFreq = params.cutoff;
    if (params.q !== undefined) this.qValue = params.q;
    if (params.type !== undefined) {
      if (typeof params.type === "number") {
        this.filtSelect = params.type;
      } else {
        if (params.type === "lowpass") this.filtSelect = 0;
        else if (params.type === "highpass") this.filtSelect = 1;
        else if (params.type === "bandpass") this.filtSelect = 2;
      }
    }

    this.updateParams();
  }

  private updateParams() {
    const typeStr: BiquadFilterType = 
      this.filtSelect === 0 ? "lowpass" :
      this.filtSelect === 1 ? "highpass" : "bandpass";

    this.filterNodes.forEach(fn => {
      fn.frequency.value = this.cutoffFreq;
      fn.Q.value = this.qValue / this.slopeSelect;
      fn.type = typeStr;
    });
  }

  getLineData(numPoints: number = 1000, fMin: number = 20, fMax: number = 20000) {
    return this.filterAnalyzer.getResponseLineData(
      this.filterNodes[0],
      numPoints,
      fMin,
      fMax,
      this.slopeSelect
    );
  }

  override destroy() {
    for (let i = 0; i < 3; i++) {
      try {
        this.filterNodes[i].disconnect(this.filterNodes[i + 1]);
      } catch (e) {}
    }
    super.destroy();
  }
}
