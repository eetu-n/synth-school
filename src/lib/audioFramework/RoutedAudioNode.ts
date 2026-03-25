export default class RoutedAudioNode<T extends AudioNode = AudioNode> {
    audioNode: T;
    name: string;
    context: AudioContext;

    private outputs = Array<RoutedAudioNode<any>>();
    private inputs = Array<RoutedAudioNode<any>>();

    constructor(name: string, context: AudioContext, audioNode: T, inputs: RoutedAudioNode<any>[] = [], outputs: RoutedAudioNode<any>[] = []) {
        this.name = name;

        this.outputs = outputs;
        this.inputs = inputs;
        this.context = context;
        this.audioNode = audioNode;
    };

    getInputs(): RoutedAudioNode<any>[] {
        return this.inputs;
    };

    getOutputs(): RoutedAudioNode<any>[] {
        return this.outputs;
    };

    addInput(inputNode: RoutedAudioNode<any>) {
        this.inputs.push(inputNode);
    };

    addOutput(inputNode: RoutedAudioNode<any>) {
        this.outputs.push(inputNode);
    };

    removeInput(inputNode: RoutedAudioNode<any>) {
        this.inputs = this.inputs.filter(node => node !== inputNode);
    };

    removeOutput(outputNode: RoutedAudioNode<any>) {
        this.outputs = this.outputs.filter(node => node !== outputNode);
    };


    // This is to facilitate RouterNode
    connectFrom(inputNode: RoutedAudioNode<any>) {
        inputNode.audioNode.connect(this.audioNode);
    };

    connect(outputNode: RoutedAudioNode<any>) {
        outputNode.connectFrom(this);
        this.addOutput(outputNode);
        outputNode.addInput(this);
    };

    disconnectFrom(inputNode: RoutedAudioNode<any>) {
        inputNode.audioNode.disconnect(this.audioNode);
    };

    disconnect(outputNode: RoutedAudioNode<any>) {
        outputNode.disconnectFrom(this);
        this.removeOutput(outputNode);
        outputNode.removeInput(this);
    }

    disconnectAll() {
        this.outputs.forEach(output => {
            this.disconnect(output);
        });
    }

    destroy() {
        for (const output of this.outputs) {
            this.disconnect(output);
        }

        for (const input of this.inputs) {
            input.disconnect(this);
        }

        this.audioNode.disconnect();
    }
}