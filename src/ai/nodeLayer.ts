import { Brain } from "./brain";

export class NodeLayer {

    public prior_layer: NodeLayer;
    public node_count: number;
    public real_node_count: number;

    private brain: Brain;
    private start_index: number;
    public values = new Array<number>();

    constructor(priorLayer: NodeLayer, nodeCount: number, isOutput: boolean) {
        this.prior_layer = priorLayer;
        this.node_count = nodeCount;
        this.real_node_count = nodeCount;

        if (!isOutput)
            this.real_node_count = nodeCount + 1;  // add the bias

        this.values = new Array<number>(this.real_node_count); 

        if (!isOutput)
            this.values[nodeCount] = 1; 
    }

    public set_weights(brain: Brain, startpos: number) {
        this.brain = brain;
        this.start_index = startpos;
    }

    public set_inputs(inputs: number[]) {
        if (this.prior_layer != null)
            throw "setInputs is only valid for input layer.";

        if (inputs.length != this.node_count)
            throw "Invalid array size.  Expecting " + this.node_count;

        for (var i=0; i<this.node_count; i++)
            this.values[i] = inputs[i];
    }

    public calculate_nodes() {
        if (this.prior_layer == null)
            return;

        for (var i=0; i<this.node_count; i++) {
            var total = 0.0;
            for (var n=0; n<this.prior_layer.real_node_count; n++) {
                total += this.brain.get_connecting_weight(this.start_index, this.prior_layer.real_node_count, i, n) * this.prior_layer.values[n];
            }

            this.values[i] = this.rectified_linear_units(total);
        }

        this.values[this.node_count] = 1; // set the bias node
    }

    private rectified_linear_units(total: number) {
        if (total<0.0)
            return 0.0;

        return total;
    }

    private sigmoid(total: number) {
        var sig = 1/(1+Math.pow(Math.E, -total));
        return sig;
    }

    private swish(total: number) {
        var swish = total / (1+Math.pow(Math.E, -total));
        return swish;
    }
}