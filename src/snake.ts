import { Position } from "./position.js";
import { SnakeSegment } from "./snakesegment.js";
import { Direction } from "./enum.js";
import { IDrawable } from "./idrawable.js";
import { Canvas } from "./canvas.js";
import { Brain } from "./ai/brain.js";
import { Game } from "./game.js";
import { Apple } from "./apple.js";

export class Snake implements IDrawable
{
    constructor(
        generation: number,
        index: number,
        brain: Brain,
        color: string
    ) {

        this.generation = generation,
        this.index = index,
        this.name = "G" + generation + "." + index;

        this.color = color;
        this.brain = brain;
        brain.set_snake(this);
    }

    public clone() {
        var newbrain = new Brain();
        newbrain.clone(this.brain, false);

        return new Snake(
            this.generation,
            this.index,
            newbrain,
            this.color
        );
    }

    private life_left: number = 200;

    public brain: Brain;

    public index: number;
    public generation: number;
    public name: string;

    public color: string;
    public head: SnakeSegment;
    public tail: SnakeSegment;
    public length: number;

    public is_dead: boolean;
    public fitness: number = 0; 

    public steps: number = 0;
    private turns: number = 0;
    private apples: Array<Apple>;
    private visited: Array<Array<boolean>>;

    public prepare(is_replay: boolean) {
        if (!is_replay) 
        {
            this.apples = new Array<Apple>();
            this.fitness = 0;
        }
        else
        {
            for (var a of this.apples)
            {
                a.eaten = false;
                a.played = false;
            }
        }

        this.visited = null;
        this.set_position(Math.floor(Canvas.MAP_WIDTH/2)+1, Math.floor(Canvas.MAP_HEIGHT/2), 3, Direction.RIGHT);         

        this.life_left = 200;
        this.is_dead = false;
        this.steps = 0;
        this.turns = 0;

        for (var i=0; i<Game.apples_on_board; i++)
            this.spawn_apple();
    }

    private set_position(headX: number, headY: number, length: number, direction: Direction) {
        var pos = new Position(headX, headY);

        this.head = new SnakeSegment(this, pos, direction);
        this.visit(pos);

        this.length = length;

        var counter = this.length;
        var cursegment = this.head;
        while (counter>1) {
            
            switch (direction) {
                case Direction.DOWN: pos.Y = pos.Y-1; break;
                case Direction.UP: pos.Y = pos.Y+1; break;
                case Direction.LEFT: pos.X = pos.X+1; break;
                case Direction.RIGHT: pos.X = pos.X-1; break;
            }
            var tail = new SnakeSegment(this, pos, direction);
            cursegment.tail = tail;
            cursegment = tail;

            counter--;
        }

        this.tail = cursegment;
    }

    private spawn_apple() {
        // see if there are any apples that have not yet been played
        for (var a of this.apples) {
            if (!a.played) {
                a.played = true;
                return;
            }
        }

        // otherwise, spawn a new one randomly
        while (true) {
            var x = Math.round((Math.random() * (Canvas.MAP_WIDTH-1))) + 1;
            var y = Math.round((Math.random() * (Canvas.MAP_HEIGHT-1))) + 1;

            var trypos = new Position(x,y);
            if (!this.is_on_tile(trypos) && this.is_apple_on_tile(trypos)==null) {
                this.apples.push(new Apple(trypos));
                break;
            }
        }
    }

    private is_apple_on_tile(pos: Position) {
        return this.is_apple_on_tile_xy(pos.X, pos.Y);
    }

    public is_apple_on_tile_xy(x: number, y: number) {
        for (var i=0; i<this.apples.length; i++) {
            if (!this.apples[i].is_visible())
                continue;

            if (this.apples[i].position.X == x && this.apples[i].position.Y == y) {
                return this.apples[i];
            }
        }
        return null;
    }

    public calc_distance_to_apple(head: Position) {
        var closest = 1000000;  // arbitrarily large number

        for (var apple of this.apples) {
            if (!apple.is_visible())
                continue;

            var dx = head.X - apple.position.X;
            var dy = head.Y - apple.position.Y;
            
            var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            if (distance < closest)
                closest = distance;
        }

        return distance;
    }

    public think() {
        var dir = this.brain.process();

        if (this.is_reverse(dir, this.head.direction))
            return this.head.direction;  // can't turn on a dime.
        else
            return dir;
    }

    private visit(pos: Position) {
        if (this.visited==null) {
            this.visited = [];
            for (var x=0; x<Canvas.MAP_WIDTH; x++) {
                this.visited[x] = [];
                for (var y=0; y<Canvas.MAP_HEIGHT; y++) {
                    this.visited[x][y] = false;
                }
            }
        }

        this.visited[pos.X-1][pos.Y-1] = true;
    }

    private is_reverse(dir1: Direction, dir2: Direction) {
        return false;

        return (dir1==Direction.UP && dir2==Direction.DOWN) ||
               (dir2==Direction.UP && dir1==Direction.DOWN) ||
               (dir1==Direction.LEFT && dir2==Direction.RIGHT) ||
               (dir2==Direction.LEFT && dir1==Direction.RIGHT);
    }

    public eat(apple: Apple) {
        apple.eaten = true;
        this.length += 1;

        this.life_left += 100;
        if (this.life_left > 500)
            this.life_left = 500;
    }

    public move(direction: Direction) {
        this.steps++;
        this.life_left--;

        if (this.life_left==0) {
            this.is_dead = true;
            return false;
        }

        if (this.head.direction!=direction)
            this.turns++;

        // create a new head, and remove the old tail
        var segment = this.head;
        var pos = Position.copy(segment.position);

        switch (direction) {
            case Direction.DOWN: pos.Y+=1; break;
            case Direction.UP: pos.Y-=1; break;
            case Direction.LEFT: pos.X-=1; break;
            case Direction.RIGHT: pos.X+=1; break;
        }

        // check to see if the snake hit the walls
        if (pos.X<1 || pos.X>Canvas.MAP_WIDTH || pos.Y<1 || pos.Y>Canvas.MAP_HEIGHT) {
            this.is_dead = true;
            return false;
        }

        var newhead = new SnakeSegment(this, pos, direction);
        newhead.tail = this.head;

        this.head = newhead;

        // now check the links to see if the head hit, and also remove the tail
        var cursegment = this.head.tail;
        var counter = this.length;
        while (counter > 1 && cursegment!=null) {

            if (cursegment.position.equals(this.head.position)) {
                this.is_dead = true;
                return false;
            }            

            counter--;
            if (counter>1)
                cursegment = cursegment.tail;
        }

        cursegment.tail = null;
        this.tail = cursegment;
        this.visit(this.head.position);

        var apple = this.is_apple_on_tile(this.head.position);
        if (apple != null) {
            this.eat(apple);
            this.spawn_apple(); // add a new apple
        }

        return true;
    }

    public is_on_tile(pos: Position) {
        return this.is_on_tile_xy(pos.X, pos.Y);
    }

    public is_on_tile_xy(x: number, y: number) {
        var segment = this.head;
        while (segment!=null) {
            if (segment.position.X == x && segment.position.Y == y)
                return true;

            segment = segment.tail;
        }

        return false;
    }


    /*
    public calculate_fitness() {
        var cells_visited = 0;
        for (var x=0; x<Canvas.MAP_WIDTH; x++) {
            for (var y=0; y<Canvas.MAP_HEIGHT; y++) {
                if (this.visited[x][y]) 
                    cells_visited++;
            }
        }

        var apple_count = 0;
        for (var a of this.apples) {
            if (a.eaten)
                apple_count++;
        }

        //var efficiency = (apple_count / this.steps); 
        //this.fitness = (apple_count * 5000) + (efficiency * 500) + (cells_visited * 10) + this.turns; 

        this.fitness = this.steps + (Math.pow(2, apple_count) + (Math.pow(apple_count, 2.1) * 500)) - (Math.pow(apple_count, 1.2) * Math.pow((0.25 * this.steps), 1.3));
    }*/
    
    public calculate_fitness() {
        var apple_count = 0;
        for (var a of this.apples) {
            if (a.eaten)
                apple_count++;
        }

        var score = apple_count + 3;

        if (score < 10) 
            this.fitness = Math.floor(this.steps * this.steps) + Math.pow(2, score);
        else
            this.fitness = Math.floor(this.steps * this.steps) * Math.pow(2, 10) * (score-9);
    }
    
    public draw() {
        var segment = this.head;
        while (segment!=null) {
            segment.draw();
            segment = segment.tail;
        }

        for (var apple of this.apples)
            apple.draw();
    }
}
