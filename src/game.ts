import { Canvas } from "./canvas.js";
import { Snake } from "./snake.js";
import { Direction, GameKey, Speed } from "./enum.js";
import { Clock } from "./clock.js";
import { Apple } from "./apple.js";
import { Position } from "./position.js";
import { Brain } from "./ai/brain.js";

export class Game {

    private speed: Speed = Speed.NORMAL;
    private snake: Snake;
    public apple: Apple;
    private clock: Clock;
    private has_moved: boolean = false;

    public init() {
        Canvas.init(<HTMLCanvasElement>document.querySelector("canvas"));

        this.start_training(200);
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
        while (generation < 1000) {
            document.querySelector("#generation_num").textContent = generation.toString();

            var bestlength = 0;
            var bestscore = 0;

            var newgen = new Array<Snake>();
            for (var i=0; i<snakeCount; i++) {
                document.querySelector("#snake_num").textContent = (i+1).toString() + " of " + snakeCount.toString();

                var newsnake: Snake = null;

                if (lastgen==null) {
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
            }

            lastgen = newgen;
            this.set_mating_pct(lastgen);

            generation++;
        }
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            if (!this.snake.is_on_tile(trypos)) {
                this.apple = new Apple(trypos);
                break;
            }
        }
    }

    private do_move(direction: Direction) {

        this.snake.move(direction);
        if (this.snake.is_dead) {
            if (this.clock!=null) this.clock.stop();
            return;
        }

        if (this.apple!=null) {
            if (this.snake.head.position.equals(this.apple.position)) {
                this.snake.eat();
                this.spawn_apple();
            }
        }

        Canvas.clear();
        if (this.apple!=null)
            this.apple.draw();

        this.snake.draw();

        this.has_moved = true;
    }
}

var newgame = new Game();
newgame.init();

