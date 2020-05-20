import { Canvas } from "./canvas.js";
import { Snake } from "./snake.js";
import { Direction, GameKey, Speed } from "./enum.js";
import { Clock } from "./clock.js";
import { Apple } from "./apple.js";
import { Position } from "./position.js";
import { Brain } from "./ai/brain.js";

export class Game {

    private static appleCount: number = 1;
    public apples: Apple[];

    private speed: Speed = Speed.NORMAL;
    private snake: Snake;
    private clock: Clock;
    private has_moved: boolean = false;

    private best_snake: Snake;

    public init() {
        Canvas.init(<HTMLCanvasElement>document.querySelector("canvas"));

        this.start_training(100);
    }

    private on_key_up(ev: KeyboardEvent) {
        console.log(ev.keyCode);

        if (ev.keyCode==GameKey.SPACEBAR) {
            switch (this.speed) {
                case Speed.NORMAL: this.speed = Speed.SLOW; break;
                case Speed.SLOW: this.speed = Speed.PAUSED; break;
                case Speed.PAUSED: this.speed = Speed.FAST; break;
                default:
                    this.speed = Speed.NORMAL;
            }
        }
    }

    private async start_training(snakeCount: number) {
        var generation = 1;

        let body: HTMLBodyElement = document.querySelector("body");
        body.onkeyup = this.on_key_up.bind(this);
        
        var lastgen: Array<Snake> = null;
        while (generation < 10000) {
            document.querySelector("#generation_num").textContent = generation.toString();

            var bestlength = 0;
            var bestscore = 0;

            var newgen = new Array<Snake>();
            for (var i=0; i<snakeCount; i++) {
                document.querySelector("#snake_num").textContent = (i+1).toString() + " of " + snakeCount.toString();

                var newsnake: Snake = null;
                var spawnrandom = Math.floor(Math.random() * 10) == 1;  // 10% of snakes will be random spawns
                var smarty = Math.floor(Math.random() * 50) == 1;

                if (lastgen==null && smarty) {

                    var brain = new Brain(this);
                    brain.spawn_smarty();

                    newsnake = this.create_snake(brain);
                } 
                else if (lastgen==null || spawnrandom) {
                    var brain = new Brain(this);
                    brain.randomize();

                    newsnake = this.create_snake(brain);
                }
                else
                    newsnake = this.spawn_from(lastgen);

                newgen.push(newsnake);

                await this.play_game(newsnake);

                var score = newsnake.calculate_score();
                var length = newsnake.length;

                if (length>bestlength) {
                    bestlength = length;
                    document.querySelector("#best_length").textContent = bestlength.toString();
                }

                if (score>bestscore) {
                    bestscore = score;
                    document.querySelector("#best_score").textContent = bestscore.toString();
                }

                if (this.best_snake==null || score>this.best_snake.score) {
                    this.best_snake = newsnake;
                    document.querySelector("#best_overall_score").textContent = newsnake.length.toString();
                    (<HTMLInputElement>document.querySelector("#best_weights")).value = JSON.stringify(newsnake.brain.weights);
                }
            }

            lastgen = this.top_half(newgen);
            this.set_mating_pct(lastgen);

            generation++;
        }
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private top_half(generation: Array<Snake>) {
        var sorted = generation.sort(function(a,b) { return b.score - a.score });
        var strong: Snake[] = [];

        for (var i=0; i<generation.length/2; i++)
            strong.push(generation[i]);
        
        return strong;
    }

    private set_mating_pct(generation: Array<Snake>) {
        var total = 0.0;
        for (var snake of generation)
            total += snake.score;

        for (var snake of generation)
            snake.mating_pct = (snake.score / total) * 100;
    }

    private spawn_from(generation: Array<Snake>) {
        var mom = this.natural_selection(generation);
        var pop = this.natural_selection(generation);
        
        return this.mate(mom, pop);        
    }

    private natural_selection(generation: Array<Snake>) {
        var rnd = Math.random() * 100;
        var total = 0.0;
        for (var snake of generation) {
            total += snake.mating_pct;
            if (total > rnd)
                return snake;
        }
        return generation[generation.length-1];  // just return the last snake
    }

    private mate(mom: Snake, pop: Snake) {

        // splice the bytes between mom and pop
        var newbrain = new Brain(this);
        newbrain.cross_over(mom.brain, pop.brain);

        return this.create_snake(newbrain);
    }

    private create_snake(brain: Brain) {
        return new Snake(this, Math.floor(Canvas.MAP_WIDTH/2)+1, Math.floor(Canvas.MAP_HEIGHT/2), 4, Direction.RIGHT, "#e3691c", brain);        
    }

    private async play_game(newsnake: Snake) {
        this.snake = newsnake;
        this.apples = [];

        for (var i=0; i<Game.appleCount; i++)
            this.spawn_apple();

        while (!newsnake.is_dead) {
            if (this.speed!=Speed.PAUSED)
            {
                var direction = this.snake.think();
                this.do_move(direction);
            }

            var ms = 30;
            if (this.speed==Speed.FAST)
                ms = 1;
            else if (this.speed==Speed.SLOW)
                ms = 50;

            await this.sleep(ms);
        }
    }

    private spawn_apple() {
        while (true) {
            var x = Math.round((Math.random() * (Canvas.MAP_WIDTH-1))) + 1;
            var y = Math.round((Math.random() * (Canvas.MAP_HEIGHT-1))) + 1;

            var trypos = new Position(x,y);
            if (!this.snake.is_on_tile(trypos) && this.is_apple_on_tile(trypos)==-1) {
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
            if (this.apples[i].position.X == x && this.apples[i].position.Y == y) {
                return i;
            }
        }
        return -1;
    }

    private do_move(direction: Direction) {

        this.snake.move(direction);
        if (this.snake.is_dead) {
            if (this.clock!=null) this.clock.stop();
            return;
        }

        var appleindex = this.is_apple_on_tile(this.snake.head.position);
        if (appleindex != -1) {
            this.apples.splice(appleindex, 1);  // remove one item
            this.snake.eat();

            this.spawn_apple(); // add a new apple
        }

        Canvas.clear();
        for (var apple of this.apples)
            apple.draw();

        this.snake.draw();

        this.has_moved = true;
    }
}

var newgame = new Game();
newgame.init();

