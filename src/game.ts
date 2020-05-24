import { Canvas } from "./canvas.js";
import { Snake } from "./snake.js";
import { Direction, GameKey, Speed } from "./enum.js";
import { Apple } from "./apple.js";
import { Position } from "./position.js";
import { Brain } from "./ai/brain.js";

export class Game {

    public static apples_on_board: number = 8;
    private static generation_size: number = 2000;
    private static max_generation: number = 1000;

    private speed: Speed = Speed.NORMAL;
    private snake: Snake;

    public init() {
        Canvas.init(<HTMLCanvasElement>document.querySelector("canvas"));

        let body: HTMLBodyElement = document.querySelector("body");
        body.onkeyup = this.on_key_up.bind(this);

        this.go();
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

    private async go() {
        var generation = 1;

        var last_gen: Array<Snake> = null;

        var best_snake: Snake = null;
        var best_overall_length: number = 0;

        while (generation <= Game.max_generation) {

            last_gen = this.train_generation(generation, last_gen, best_snake);

            var sorted = last_gen.sort(function(a,b) { return b.score - a.score });
            best_snake = sorted[0];

            // find the best length
            var best_length = 0;
            for (var i in last_gen) {
                if (last_gen[i].length > best_length)
                    best_length = last_gen[i].length;
            }

            if (best_length > best_overall_length)
                best_overall_length = best_length;

            document.querySelector("#best_length").textContent = best_length.toString();
            document.querySelector("#best_overall_length").textContent = best_overall_length.toString();
            (<HTMLInputElement>document.querySelector("#best_weights")).value = JSON.stringify(best_snake.brain.weights);

            await this.replay_best_snake(generation, best_snake);
            generation++;
        }
    }

    private train_generation(generation: number, last_gen: Array<Snake>, best_snake: Snake)
    {
        document.querySelector("#generation_num").textContent = generation.toString() + " in Training";

        var total_score = 0;
        if (last_gen!=null) {
            for (var snake of last_gen)
                total_score += snake.score;
        }

        var new_gen = new Array<Snake>();
        for (var i=0; i<Game.generation_size; i++) {

            var new_snake: Snake = null;
            if (i==0 && best_snake!=null)
                new_snake = best_snake;
            else
                new_snake = this.spawn_snake(last_gen, total_score);
            
            new_gen.push(new_snake);
            new_snake.index = new_gen.length;

            this.simulate_game(new_snake);
            var score = new_snake.calculate_score();
        }

        return new_gen;
    }

    private async replay_best_snake(generation: number, best_snake: Snake) 
    {
        document.querySelector("#generation_num").textContent = generation.toString() + " Champion";
        document.querySelector("#best_score").textContent = best_snake.score.toString();

        await this.replay_game(best_snake);
    }

    private spawn_snake(lastgen: Array<Snake>, total_score: number) {
        var spawnrandom = Math.floor(Math.random() * 10) == 1;  // 10% of snakes will be random spawns
        var smarty = false; //Math.floor(Math.random() * 25) == 1;

        var brain = new Brain();
        if (lastgen==null && smarty) {
            brain.spawn_smarty();
        } 
        else if (lastgen==null || spawnrandom) {
            brain.randomize();
        }
        else {
            this.spawn_from(brain, lastgen, total_score);
        }

        var new_snake = new Snake(brain, "#e3691c");        
        return new_snake;
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

    private spawn_from(brain: Brain, generation: Array<Snake>, total_score: number) {
        var mom = this.natural_selection(generation, total_score);
        
        var shouldmate = Math.floor(Math.random() * 2) == 1;
        if (shouldmate) {
            var pop = this.natural_selection(generation, total_score);

            brain.cross_over(mom.brain, pop.brain);
        }
        else {
            brain.clone(mom.brain);
        }
    }

    private natural_selection(generation: Array<Snake>, total_score: number) {
        var rnd = Math.random() * total_score;
        var total = 0.0;
        for (var snake of generation) {
            total += snake.score;
            if (total > rnd)
                return snake;
        }
        return generation[generation.length-1];  // just return the last snake
    }

    private simulate_game(new_snake: Snake) {

        this.snake = new_snake;
        this.snake.prepare(false);

        while (!this.snake.is_dead) {
            var direction = this.snake.think();
            this.do_move(direction, false);
        }
    }

    private async replay_game(best_snake: Snake) {
        this.snake = best_snake;
        this.snake.prepare(true);

        while (!this.snake.is_dead) {
            if (this.speed!=Speed.PAUSED)
            {
                var direction = this.snake.think();
                this.do_move(direction, true);
            }

            var ms = 40;
            if (this.speed==Speed.FAST)
                ms = 1;
            else if (this.speed==Speed.SLOW)
                ms = 75;

            await this.sleep(ms);
        }
    }

    private do_move(direction: Direction, draw: boolean) {

        this.snake.move(direction);
        if (this.snake.is_dead)
            return;

        if (draw)
        {
            Canvas.clear();
            this.snake.draw();
        }
    }
}

var newgame = new Game();
newgame.init();

