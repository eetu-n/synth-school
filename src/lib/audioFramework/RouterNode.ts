import RoutedAudioNode from "$lib/audioFramework/RoutedAudioNode";

export default class RouterNode extends RoutedAudioNode{
    constructor (name: string, context: AudioContext, inputs: RoutedAudioNode<any>[] = [], outputs: RoutedAudioNode<any>[] = []) {
        super(name, context, new AudioNode, inputs, outputs);
    }

    connectFrom(inputNode: RoutedAudioNode<any>): void {
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