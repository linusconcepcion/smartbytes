import { NodeLayer } from './nodeLayer.js';
import { Direction } from '../enum.js';
import { Canvas } from '../canvas.js';
import { Smarties } from './saves.js';
export class Brain {
    constructor() {
        var inputs = new NodeLayer(null, 24, false);
        var hidden1 = new NodeLayer(inputs, 18, false);
        var hidden2 = new NodeLayer(hidden1, 18, false);
        var output = new NodeLayer(hidden2, 4, true);
        this.layers = [inputs, hidden1, hidden2, output];
        this.init_dna();
    }
    get_connecting_weight(startpos, nodecount, i, n) {
        var index = startpos + (i * nodecount) + n;
        return this.weights[index];
    }
    init_dna() {
        this.weights = [];
        for (var layer of this.layers) {
            if (layer.prior_layer == null)
                continue;
            layer.set_weights(this, this.weights.length);
            for (var n = 0; n < layer.node_count; n++) {
                for (var i = 0; i < layer.prior_layer.real_node_count; i++)
                    this.weights.push(0);
            }
        }
    }
    set_snake(snake) {
        this.snake = snake;
    }
    spawn_smarty() {
        var rnd = Math.floor(Math.random() * Smarties.smart_snakes.length);
        for (var i = 0; i < this.weights.length; i++)
            this.weights[i] = Smarties.smart_snakes[rnd][i];
        this.mutate();
    }
    clone(parent) {
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] = parent.weights[i];
        }
        this.mutate();
    }
    cross_over(mom, pop) {
        var splicecount = 5;
        var splicepoints = [];
        while (splicepoints.length < splicecount) {
            var point = Math.floor((Math.random() * this.weights.length - 1)) + 1;
            if (splicepoints.indexOf(point) == -1)
                splicepoints.push(point);
        }
        var source = mom;
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] = source.weights[i];
            if (splicepoints.indexOf(i) != -1) {
                if (source == mom)
                    source = pop;
                else
                    source = mom;
            }
        }
        this.mutate();
    }
    randomize() {
        for (var i in this.weights) {
            this.weights[i] = (Math.random() * 2) - 1;
        }
    }
    mutate() {
        for (var i = 0; i < this.weights.length; i++) {
            var shouldMutate = (Math.floor(Math.random() * 20)) == 1;
            if (shouldMutate) {
                this.weights[i] = (Math.random() * 2) - 1;
            }
        }
    }
    process(hunger) {
        var headpos = this.snake.head.position;
        var inputs = [];
        var directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
        for (var d in directions) {
            var direction = directions[d];
            var scan = this.scan_direction(headpos, direction[0], direction[1]);
            //inputs.push(scan);
            inputs.push(scan[0]);
            inputs.push(scan[1]);
            inputs.push(scan[2]);
        }
        this.layers[0].set_inputs(inputs);
        for (var i = 1; i < this.layers.length; i++)
            this.layers[i].calculate_nodes();
        var outputs = this.layers[this.layers.length - 1];
        // find the max among the outputs
        var curdir = Direction.UP;
        var curmax = outputs.values[0];
        if (outputs.values[1] > curmax) {
            curmax = outputs.values[1];
            curdir = Direction.RIGHT;
        }
        if (outputs.values[2] > curmax) {
            curmax = outputs.values[2];
            curdir = Direction.DOWN;
        }
        if (outputs.values[3] > curmax) {
            curmax = outputs.values[3];
            curdir = Direction.LEFT;
        }
        return curdir;
    }
    scan_direction(head, dx, dy) {
        var result = [0, 0, 0]; // snake, apple, wall
        var x = head.X;
        var y = head.Y;
        var count = 0;
        var max = 0;
        if (dy == 0)
            max = Canvas.MAP_WIDTH;
        else if (dx == 0)
            max = Canvas.MAP_HEIGHT;
        else
            max = Canvas.DIAGONAL;
        while (x > 0 && y > 0 && x <= Canvas.MAP_WIDTH && y <= Canvas.MAP_HEIGHT) {
            x = x + dx;
            y = y + dy;
            count++;
            if (result[0] == 0 && this.snake.is_on_tile_xy(x, y))
                result[0] = 1;
            else if (result[1] == 0 && this.snake.is_apple_on_tile_xy(x, y) != null)
                result[1] = 1;
        }
        result[2] = 1 / (count + 1);
        return result;
    }
    scan_direction2(head, dx, dy) {
        var result = [0, 0, 0]; // snake, apple, wall
        var x = head.X;
        var y = head.Y;
        var count = 0;
        var max = 0;
        if (dy == 0)
            max = Canvas.MAP_WIDTH;
        else if (dx == 0)
            max = Canvas.MAP_HEIGHT;
        else
            max = Canvas.DIAGONAL;
        var signal = 0.0;
        while (x > 0 && y > 0 && x <= Canvas.MAP_WIDTH && y <= Canvas.MAP_HEIGHT) {
            x = x + dx;
            y = y + dy;
            count++;
            signal = (max - (count - 1)) / max;
            if (result[0] == 0 && this.snake.is_on_tile_xy(x, y))
                return -signal;
            else if (result[1] == 0 && this.snake.is_apple_on_tile_xy(x, y) != null)
                return signal;
        }
        return -signal;
    }
    direction_to_input(direction) {
        switch (direction) {
            case Direction.UP:
                return [1, 0, 0, 0];
                break;
            case Direction.RIGHT:
                return [0, 1, 0, 0];
                break;
            case Direction.DOWN:
                return [0, 0, 1, 0];
                break;
            case Direction.LEFT:
                return [0, 0, 0, 1];
                break;
            default:
                throw "Invalid Direction.";
        }
    }
}
