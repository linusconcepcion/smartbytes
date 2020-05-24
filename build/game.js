var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Canvas } from "./canvas.js";
import { Snake } from "./snake.js";
import { GameKey, Speed } from "./enum.js";
import { Brain } from "./ai/brain.js";
let Game = /** @class */ (() => {
    class Game {
        constructor() {
            this.speed = Speed.NORMAL;
        }
        init() {
            Canvas.init(document.querySelector("canvas"));
            let body = document.querySelector("body");
            body.onkeyup = this.on_key_up.bind(this);
            this.go();
        }
        on_key_up(ev) {
            console.log(ev.keyCode);
            if (ev.keyCode == GameKey.SPACEBAR) {
                switch (this.speed) {
                    case Speed.NORMAL:
                        this.speed = Speed.SLOW;
                        break;
                    case Speed.SLOW:
                        this.speed = Speed.PAUSED;
                        break;
                    case Speed.PAUSED:
                        this.speed = Speed.FAST;
                        break;
                    default:
                        this.speed = Speed.NORMAL;
                }
            }
        }
        go() {
            return __awaiter(this, void 0, void 0, function* () {
                var generation = 1;
                var last_gen = null;
                var best_overall_length = 0;
                var best_overall_score = 0;
                var best_overall_snake = null;
                var best_snake = null;
                while (generation <= Game.max_generation) {
                    last_gen = this.train_generation(generation, last_gen, best_snake);
                    var sorted = last_gen.sort(function (a, b) { return b.score - a.score; });
                    best_snake = sorted[0];
                    console.log("generation" + generation + ": " + best_snake.score);
                    // find the best length
                    var best_length = 0;
                    for (var i in last_gen) {
                        if (last_gen[i].length > best_length)
                            best_length = last_gen[i].length;
                    }
                    if (best_length > best_overall_length)
                        best_overall_length = best_length;
                    if (best_snake.score > best_overall_score) {
                        best_overall_score = best_snake.score;
                        best_overall_snake = best_snake;
                    }
                    document.querySelector("#best_length").textContent = best_length.toString();
                    document.querySelector("#best_overall_length").textContent = best_overall_length.toString();
                    document.querySelector("#best_overall_snake").textContent = best_overall_snake.name;
                    document.querySelector("#best_weights").value = JSON.stringify(best_overall_snake.brain.weights);
                    yield this.replay_best_snake(generation, best_snake);
                    generation++;
                }
            });
        }
        train_generation(generation, last_gen, best_snake) {
            document.querySelector("#generation_num").textContent = generation.toString() + " in Training";
            var total_score = 0;
            if (last_gen != null) {
                for (var snake of last_gen)
                    total_score += snake.score;
            }
            var new_gen = new Array();
            for (var i = 0; i < Game.generation_size; i++) {
                var new_snake = null;
                if (i == 0 && best_snake != null)
                    new_snake = best_snake;
                else
                    new_snake = this.spawn_snake(generation, new_gen.length + 1, last_gen, total_score);
                new_gen.push(new_snake);
                this.simulate_game(new_snake);
                new_snake.calculate_score();
            }
            return new_gen;
        }
        replay_best_snake(generation, best_snake) {
            return __awaiter(this, void 0, void 0, function* () {
                document.querySelector("#generation_num").textContent = generation.toString() + " Champion";
                document.querySelector("#best_score").textContent = best_snake.score.toString();
                yield this.replay_game(best_snake);
            });
        }
        spawn_snake(generation, index, lastgen, total_score) {
            var spawnrandom = Math.floor(Math.random() * 10) == 1; // 10% of snakes will be random spawns
            var smarty = false; //Math.floor(Math.random() * 25) == 1;
            var brain = new Brain();
            if (lastgen == null && smarty) {
                brain.spawn_smarty();
            }
            else if (lastgen == null || spawnrandom) {
                brain.randomize();
            }
            else {
                this.spawn_from(brain, lastgen, total_score);
            }
            var new_snake = new Snake(generation, index, brain, "#e3691c");
            return new_snake;
        }
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        top_half(generation) {
            var sorted = generation.sort(function (a, b) { return b.score - a.score; });
            var strong = [];
            for (var i = 0; i < generation.length / 2; i++)
                strong.push(generation[i]);
            return strong;
        }
        spawn_from(brain, generation, total_score) {
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
        natural_selection(generation, total_score) {
            var rnd = Math.random() * total_score;
            var total = 0.0;
            for (var snake of generation) {
                total += snake.score;
                if (total > rnd)
                    return snake;
            }
            return generation[generation.length - 1]; // just return the last snake
        }
        simulate_game(new_snake) {
            this.snake = new_snake;
            this.snake.prepare(false);
            while (!this.snake.is_dead) {
                var direction = this.snake.think();
                this.do_move(direction, false);
            }
        }
        replay_game(best_snake) {
            return __awaiter(this, void 0, void 0, function* () {
                this.snake = best_snake;
                this.snake.prepare(true);
                while (!this.snake.is_dead) {
                    if (this.speed != Speed.PAUSED) {
                        var direction = this.snake.think();
                        this.do_move(direction, true);
                    }
                    var ms = 40;
                    if (this.speed == Speed.FAST)
                        ms = 1;
                    else if (this.speed == Speed.SLOW)
                        ms = 75;
                    yield this.sleep(ms);
                }
            });
        }
        do_move(direction, draw) {
            this.snake.move(direction);
            if (this.snake.is_dead)
                return;
            if (draw) {
                Canvas.clear();
                this.snake.draw();
            }
        }
    }
    Game.apples_on_board = 8;
    Game.generation_size = 2000;
    Game.max_generation = 1000;
    return Game;
})();
export { Game };
var newgame = new Game();
newgame.init();
