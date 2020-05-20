import { Brain } from "./brain";

export class NodeLayer {

    public prior_layer: NodeLayer;
    public node_count: number;

    private brain: Brain;
    private start_index: number;
    public values = new Array<number>();

    constructor(priorLayer: NodeLayer, nodeCount: number) {
        this.prior_layer = priorLayer;
        this.node_count = nodeCount;

        this.values = new Array<number>(nodeCount);
    }

    public set_weights(brain: Brain, startpos: number) {
        this.brain = brain;
        this.start_index = startpos;
    }

/*
    public cross_over(mom: NodeLayer, pop: NodeLayer) {
        this.weights = [];
        for (var i=0; i<this.node_count; i++) {

            this.weights[i] = [];
            for (var n=0; n<this.prior_layer.node_count; n++) {
                var choice = Math.floor(Math.random() * 2);
                if (choice==0)
                    this.weights[i][n] = mom.weights[i][n];
                else
                    this.weights[i][n] = pop.weights[i][n];

                var shouldMutate = (Math.floor(Math.random() * 15))==1;
                if (shouldMutate) {
                    this.weights[i][n] = (Math.random() * 2)-1;
                    //this.weights[i][n] = this.weights[i][n] * (Math.random() * 0.5); 
                }
            }
        }
    }

    public randomize() {
        if (this.prior_layer==null)
            return;

        for (var i=0; i<this.node_count; i++) {
            var nodeweights: number[] = [];
            for (var n=0; n<this.prior_layer.node_count; n++) {
                nodeweights.push((Math.random() * 2)-1);   
            }

            this.weights.push(nodeweights);
        }
    }
*/

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
            for (var n=0; n<this.prior_layer.node_count; n++) {
                total += this.brain.get_connecting_weight(this.start_index, this.prior_layer.node_count, i, n) * this.prior_layer.values[n];
            }

            this.values[i] = this.rectified_linear_units(total);
        }
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
}