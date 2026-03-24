export default class RoutedAudioNode<T extends AudioNode = AudioNode> {
    audioNode: T;
    name: string;
    context: AudioContext;

    outputs = Array<RoutedAudioNode<any>>();
    inputs = Array<RoutedAudioNode<any>>();

    constructor(name: string, context: AudioContext, audioNode: T, inputs: RoutedAudioNode<any>[] = [], outputs: RoutedAudioNode<any>[] = []) {
        this.name = name;

        this.outputs = outputs;
        this.inputs = inputs;
        this.context = context;
        this.audioNode = audioNode;
    }

    connect(destinationNode: RoutedAudioNode<any>) {
        this.audioNode.connect(destinationNode.audioNode);
        this.outputs.push(destinationNode);
        destinationNode.inputs.push(this);
    };

    disconnect(destinationNode: RoutedAudioNode<any>) {
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