import { Snake } from '../snake.js'
import { SnakeSegment } from '../snakesegment.js'
import { NodeLayer } from './nodeLayer.js'
import { Position } from '../position.js';
import { Direction } from '../enum.js';
import { Canvas } from '../canvas.js';

export class Brain {

    private snake: Snake;
    private layers: NodeLayer[];
    public weights: number[];

    constructor() {

        var inputs = new NodeLayer(null, 13, false);
        var hidden1 = new NodeLayer(inputs, 36, false);
        var hidden2 = new NodeLayer(hidden1, 36, false);
        var output = new NodeLayer(hidden2, 4, true);

        this.layers = [inputs, hidden1, hidden2, output];
        this.init_dna();
    }

    public get_connecting_weight(startpos: number, nodecount: number, i: number, n: number) {
        var index = startpos + (i * nodecount) + n;
        return this.weights[index];
    }

    private init_dna() {
        this.weights = [];

        for (var layer of this.layers) {
            if (layer.prior_layer==null)
                continue;
            
            layer.set_weights(this, this.weights.length);
            for (var n=0; n<layer.node_count; n++) {
                for (var i=0; i<layer.prior_layer.real_node_count; i++)
                    this.weights.push(0);
            }
        }
    }

    public set_snake(snake: Snake) {
        this.snake = snake;
    }

    public clone(parent: Brain, mutate: boolean) {
        
        for (var i=0; i<this.weights.length; i++) {
            this.weights[i] = parent.weights[i];
        }

        if (mutate)
            this.mutate();
    }

    public cross_over(mom: Brain, pop: Brain) {
        var splicecount = 4;
        var splicepoints = [];
        while (splicepoints.length<splicecount) {
            var point = Math.floor((Math.random() * this.weights.length-1))+1;
            if (splicepoints.indexOf(point)==-1)
                splicepoints.push(point);
        }

        var source = mom;
        for (var i=0; i<this.weights.length; i++) {
            this.weights[i] = source.weights[i];
            if (splicepoints.indexOf(i)!=-1) {
                if (source==mom)
                    source = pop;
                else
                    source = mom;
            }
        }

        this.mutate();
    }

    public randomize() {
        for (var i in this.weights) {
            this.weights[i] = (Math.random() * 2)-1;
        }
    }


    private mutate() {
        for (var i=0; i<this.weights.length; i++) {
            var shouldMutate = (Math.floor(Math.random() * 20))==1;
            if (shouldMutate) {
                this.weights[i] += (Math.random() / 4);
                if (this.weights[i] > 1)
                    this.weights[i] = 1;
                else if (this.weights[i] < -1)
                    this.weights[i] = -1; 
            }
        }
    }

    public process() {
        var headpos = this.snake.head.position;
        var inputs = [];

        Canvas.clear_sight_lines();
        
        var directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]; 
        var directions = [[0, -1], [1,0], [0,-1], [-1,0]]



        for (var d in directions) {
            var direction = directions[d];
            var scan = this.scan_direction(headpos, direction[0], direction[1]);

            inputs.push(scan[0]);
            //inputs.push(scan[1]);
            inputs.push(scan[2]);
        }

        inputs.push(this.marco_polo(this.snake.head.position, Direction.UP));
        inputs.push(this.marco_polo(this.snake.head.position, Direction.RIGHT));
        inputs.push(this.marco_polo(this.snake.head.position, Direction.DOWN));
        inputs.push(this.marco_polo(this.snake.head.position, Direction.LEFT));

        inputs.push(this.dead_if_straight(this.snake.head));

        this.layers[0].set_inputs(inputs);

        for (var i=1; i<this.layers.length; i++)
            this.layers[i].calculate_nodes();

        var outputs = this.layers[this.layers.length-1];
        
        // find the max among the outputs
        var curdir: Direction = Direction.UP;
        var curmax = outputs.values[0];

        if (outputs.values[1]>curmax) {
            curmax = outputs.values[1];
            curdir = Direction.RIGHT;
        }
        if (outputs.values[2]>curmax) {
            curmax = outputs.values[2];
            curdir = Direction.DOWN;
        }
        if (outputs.values[3]>curmax) {
            curmax = outputs.values[3];
            curdir = Direction.LEFT;
        }
        return curdir;
    }

    private dead_if_straight(head: SnakeSegment) {

        var next_pos = Position.copy(head.position);
        switch (head.direction) {
            case Direction.UP: next_pos.Y -= 1; break;
            case Direction.DOWN: next_pos.Y += 1; break;
            case Direction.LEFT: next_pos.X -= 1; break;
            case Direction.RIGHT: next_pos.X += 1; break;
        }

        if (!(next_pos.X>0 && next_pos.Y>0 && next_pos.X<=Canvas.MAP_WIDTH && next_pos.Y<=Canvas.MAP_HEIGHT))
            return -1;

        if (this.snake.is_on_tile_xy(next_pos.X, next_pos.Y))
            return -1;

        return 0;
    }

    private marco_polo(head: Position, direction: Direction) {
        var cur_distance = this.snake.calc_distance_to_apple(head);

        var next_pos = Position.copy(head);
        switch (direction) {
            case Direction.UP: next_pos.Y -= 1; break;
            case Direction.DOWN: next_pos.Y += 1; break;
            case Direction.LEFT: next_pos.X -= 1; break;
            case Direction.RIGHT: next_pos.X += 1; break;
        }

        var next_distance = this.snake.calc_distance_to_apple(next_pos);
        if (cur_distance < next_distance)
            return -1;
        else if (cur_distance > next_distance)
            return 1;
        else
            return 0;
    }


    private scan_direction(head: Position, dx: number, dy: number) {
        var result = [0, 0, 0];  // snake, apple, wall

        var x = head.X;
        var y = head.Y;
        var count = 0;

        var vision_color = "#555";
        while (x>0 && y>0 && x<=Canvas.MAP_WIDTH && y<=Canvas.MAP_HEIGHT) {
            x = x + dx;
            y = y + dy;
            count++;

            if (result[0]==0 && this.snake.is_on_tile_xy(x, y))
            {
                vision_color = "#F55";
                result[0] = 1/count;
            }
            
            else if (result[1]==0 && result[0]==0 && this.snake.is_apple_on_tile_xy(x, y)!=null)
            {
                vision_color = "#5F5";
                result[1] = 1;
            }

            if (x>0 && y>0 && x<=Canvas.MAP_WIDTH && y<=Canvas.MAP_HEIGHT)
                Canvas.draw_sight_line(x, y, vision_color);
        }
        result[2] = 1/count;

        return result;
    }

    private direction_to_input(direction: Direction) {
        switch (direction) {
            case Direction.UP: return [1, 0, 0, 0]; break;
            case Direction.RIGHT: return [0, 1, 0, 0]; break;
            case Direction.DOWN: return [0, 0, 1, 0]; break;
            case Direction.LEFT: return [0, 0, 0, 1]; break;
            default:
                throw "Invalid Direction.";
        }
    }

}