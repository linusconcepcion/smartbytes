export class NodeLayer {
    constructor(priorLayer, nodeCount) {
        this.values = new Array();
        this.prior_layer = priorLayer;
        this.node_count = nodeCount;
        this.values = new Array(nodeCount);
    }
    set_weights(brain, startpos) {
        this.brain = brain;
        this.start_index = startpos;
    }
    set_inputs(inputs) {
        if (this.prior_layer != null)
            throw "setInputs is only valid for input layer.";
        if (inputs.length != this.node_count)
            throw "Invalid array size.  Expecting " + this.node_count;
        for (var i = 0; i < this.node_count; i++)
            this.values[i] = inputs[i];
    }
    calculate_nodes() {
        if (this.prior_layer == null)
            return;
        for (var i = 0; i < this.node_count; i++) {
            var total = 0.0;
            for (var n = 0; n < this.prior_layer.node_count; n++) {
                total += this.brain.get_connecting_weight(this.start_index, this.prior_layer.node_count, i, n) * this.prior_layer.values[n];
            }
            this.values[i] = this.rectified_linear_units(total);
        }
    }
    rectified_linear_units(total) {
        if (total < 0.0)
            return 0.0;
        return total;
    }
    sigmoid(total) {
        var sig = 1 / (1 + Math.pow(Math.E, -total));
        return sig;
    }
}
