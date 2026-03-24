export default class RoutedAudioNode {
    audioNode: AudioNode;
    name: string;
    context: AudioContext;

    outputs = Array<RoutedAudioNode>();
    inputs = Array<RoutedAudioNode>();

    constructor(name: string, context: AudioContext, audioNode: AudioNode, inputs = [], outputs = []) {
        this.name = name;

        this.outputs = outputs;
        this.inputs = inputs;
        this.context = context;
        this.audioNode = audioNode;
    }

    connect(destinationNode: RoutedAudioNode) {
        this.audioNode.connect(destinationNode.audioNode);
        this.outputs.push(destinationNode);
        destinationNode.inputs.push(this);
    };

    disconnect(destinationNode: RoutedAudioNode) {
        destinationNode.audioNode.disconnect(this.audioNode);
        destinationNode.inputs = destinationNode.inputs.filter(input => input !== this);
        this.outputs = this.outputs.filter(output => output !== destinationNode);
    }

    disconnectAll() {
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