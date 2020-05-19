import { Snake } from '../snake.js'
import { Game } from '../game.js'
import { NodeLayer } from './nodeLayer.js'
import { Position } from '../position.js';
import { Direction } from '../enum.js';
import { Canvas } from '../canvas.js';

export class Brain {

    private snake: Snake;
    private game: Game;
    private layers: NodeLayer[];

    constructor(game: Game) {
        this.game = game;

        var inputs = new NodeLayer(null, 32);
        var hidden1 = new NodeLayer(inputs, 20);
        var hidden2 = new NodeLayer(hidden1, 12);
        var output = new NodeLayer(hidden2, 4);

        this.layers = [inputs, hidden1, hidden2, output];
    }

    public set_snake(snake: Snake) {
        this.snake = snake;
    }

    public cross_over(mom: Brain, pop: Brain) {
        for (var i=1; i<this.layers.length; i++) {
            this.layers[i].cross_over(mom.layers[i], pop.layers[i]);
        }
    }

    public randomize() {
        for (var layer of this.layers) {
            layer.randomize();
        }
    }
 
    public process() {
        var headpos = this.snake.head.position;
        var applepos = this.game.apple.position;
        var inputs = [];
        
        var directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]; 
        for (var d in directions) {
            var direction = directions[d];
            var scan = this.scan_direction(headpos, applepos, direction[0], direction[1]);
            inputs.push(scan[0]);
            inputs.push(scan[1]);
            inputs.push(scan[2]);
        }

        var hdir = this.direction_to_input(this.snake.head.direction);
        inputs.push(hdir[0]);
        inputs.push(hdir[1]);
        inputs.push(hdir[2]);
        inputs.push(hdir[3]);

        var tdir = this.direction_to_input(this.snake.tail.direction);
        inputs.push(tdir[0]);
        inputs.push(tdir[1]);
        inputs.push(tdir[2]);
        inputs.push(tdir[3]);

        this.layers[0].setInputs(inputs);

        for (var i=1; i<this.layers.length; i++)
            this.layers[i].calculateNodes();

        var outputs = this.layers[this.layers.length-1];
        
        // find the max among the outputs
        var curdir: Direction = Direction.UP;
        var curmax = outputs.values[0];;

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

    private scan_direction(head: Position, apple: Position, dx: number, dy: number) {
        var result = [0, 0, 0];  // snake, apple, wall

        var x = head.X + dx;
        var y = head.Y + dy;
        var count = 0;

        /*
        var max = 0;
        if (dy==0)
            max = Canvas.MAP_WIDTH;
        else if (dx==0)
            max = Canvas.MAP_HEIGHT;
        else
            max = Canvas.DIAGONAL; */

        var max = 1;
        while (x>0 && y>0 && x<=Canvas.MAP_WIDTH && y<=Canvas.MAP_HEIGHT) {
            x = x + dx;
            y = y + dy;
            count++;

            if (result[0]==0 && this.snake.is_on_tile_xy(x, y))
                result[0] = count / max;
            
            else if (result[1]==0 && apple.X==x && apple.Y==y)
                result[1] = count / max;
        }
        result[2] = count / max;

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