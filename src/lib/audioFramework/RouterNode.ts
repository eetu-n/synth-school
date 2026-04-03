import RoutedAudioNode from "$lib/audioFramework/RoutedAudioNode";

export default class RouterNode extends RoutedAudioNode{
    constructor (name: string, context: AudioContext) {
        super(name, context);
    }

    connect(outputNode: RoutedAudioNode<any>): void {
        console.log("Routing " + this.name + " to " + outputNode.name);
        this.addOutput(outputNode);
        outputNode.addInput(this);
        this.getInputs().forEach(input => {
            outputNode.connectFrom(input);
        });
    };

    connectFrom(inputNode: RoutedAudioNode<any>): void {
        console.log("Routing " + inputNode.name + " via " + this.name);
        this.getOutputs().forEach(output => {
            output.connectFrom(inputNode);
        });
    }

    disconnectFrom(outputNode: RoutedAudioNode<any>): void {
        this.getOutputs().forEach(output => {
            output.disconnectFrom(outputNode);
        });
    }
};