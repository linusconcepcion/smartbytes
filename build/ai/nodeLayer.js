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
    setInputs(inputs) {
        if (this.prior_layer != null)
            throw "setInputs is only valid for input layer.";
        if (inputs.length != this.node_count)
            throw "Invalid array size.  Expecting " + this.node_count;
        for (var i = 0; i < this.node_count; i++)
            this.values[i] = inputs[i];
    }
    calculateNodes() {
        if (this.prior_layer == null)
            return;
        for (var i = 0; i < this.node_count; i++) {
            var total = 0.0;
            for (var n = 0; n < this.prior_layer.node_count; n++) {
                total += this.brain.get_connecting_weight(this.start_index, this.node_count, i, n) * this.prior_layer.values[n];
            }
            this.values[i] = this.rectifiedLinearUnits(total);
        }
    }
    rectifiedLinearUnits(total) {
        if (total < 0.0)
            return 0.0;
        return total;
    }
}
