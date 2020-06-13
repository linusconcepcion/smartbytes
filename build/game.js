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
import { Smarties } from "./smarties.js";
let Game = /** @class */ (() => {
    class Game {
        constructor() {
            this.smarty_index = 0;
            this.best_overall_length = 0;
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
                        this.speed = Speed.PAUSED;
                        break;
                    //case Speed.SLOW: this.speed = Speed.PAUSED; break;
                    //case Speed.PAUSED: this.speed = Speed.FAST; break;
                    default:
                        this.speed = Speed.NORMAL;
                }
            }
        }
        go() {
            return __awaiter(this, void 0, void 0, function* () {
                var generation = 1;
                var last_gen = null;
                var best_overall_score = 0;
                var best_overall_snake = null;
                var best_snake = null;
                while (generation <= Game.max_generation) {
                    var new_gen = this.train_generation(generation, last_gen, best_snake);
                    last_gen = new_gen.sort(function (a, b) { return b.fitness - a.fitness; });
                    best_snake = last_gen[0];
                    console.log("training steps: " + best_snake.steps);
                    // find the best length
                    var best_length = 0;
                    for (var i in last_gen) {
                        if (last_gen[i].length > best_length)
                            best_length = last_gen[i].length;
                    }
                    var new_champion = (best_length > this.best_overall_length);
                    if (best_snake.fitness > best_overall_score) {
                        best_overall_score = best_snake.fitness;
                        best_overall_snake = best_snake;
                    }
                    yield this.replay_best_snake(generation, best_snake, new_champion);
                    if (new_champion)
                        this.best_overall_length = best_length;
                    document.querySelector("#best_overall_length").textContent = this.best_overall_length.toString();
                    document.querySelector("#best_overall_snake").textContent = best_overall_snake.name;
                    document.querySelector("#best_weights").value = JSON.stringify(best_overall_snake.brain.weights);
                    generation++;
                }
            });
        }
        train_generation(generation, last_gen, best_snake) {
            document.querySelector("#generation_num").textContent = generation.toString();
            var total_score = 0;
            if (last_gen != null) {
                for (var snake of last_gen)
                    total_score += snake.fitness;
            }
            var new_gen = new Array();
            for (var i = 0; i < Game.generation_size; i++) {
                var new_snake = null;
                if (i == 0 && best_snake != null) {
                    new_snake = best_snake.clone();
                }
                else
                    new_snake = this.spawn_snake(generation, new_gen.length + 1, last_gen, total_score);
                new_gen.push(new_snake);
                this.simulate_game(new_snake);
                new_snake.calculate_fitness();
            }
            return new_gen;
        }
        replay_best_snake(generation, best_snake, new_champion) {
            return __awaiter(this, void 0, void 0, function* () {
                if (new_champion)
                    document.querySelector("#generation_num").textContent = generation.toString() + " NEW CHAMPION!";
                else
                    document.querySelector("#generation_num").textContent = generation.toString();
                yield this.replay_game(best_snake, new_champion);
                console.log("replay steps: " + best_snake.steps);
            });
        }
        spawn_snake(generation, index, lastgen, total_score) {
            var spawnrandom = Math.floor(Math.random() * 50) == 1;
            var smarty = false; //Math.floor(Math.random() * 250) == 1;
            var brain = new Brain();
            if (smarty) {
                brain.weights = Smarties.snakes[this.smarty_index];
                this.smarty_index++;
                if (this.smarty_index >= Smarties.snakes.length)
                    this.smarty_index = 0;
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
        spawn_from(brain, generation, total_score) {
            var mom = this.natural_selection(generation, total_score, null);
            var shouldmate = Math.floor(Math.random() * 2) == 1;
            if (shouldmate) {
                var pop = this.natural_selection(generation, total_score, mom);
                brain.cross_over(mom.brain, pop.brain);
            }
            else {
                brain.clone(mom.brain, true);
            }
        }
        natural_selection(generation, total_score, mom) {
            if (mom != null)
                total_score -= mom.fitness;
            var rnd = Math.random() * total_score;
            var total = 0.0;
            for (var snake of generation) {
                if (mom != null && snake == mom)
                    continue;
                total += snake.fitness;
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
        replay_game(best_snake, new_champion) {
            return __awaiter(this, void 0, void 0, function* () {
                this.snake = best_snake;
                this.snake.prepare(true);
                var length = 0;
                while (!this.snake.is_dead) {
                    if (this.speed != Speed.PAUSED) {
                        var direction = this.snake.think();
                        this.do_move(direction, true);
                        if (length != this.snake.length) {
                            length = this.snake.length;
                            document.querySelector("#current_length").textContent = length.toString();
                        }
                    }
                    var ms = 55;
                    if (this.speed == Speed.FAST)
                        ms = 1;
                    else if (this.speed == Speed.SLOW)
                        ms = 100;
                    else if (this.speed == Speed.NORMAL) {
                        if (this.snake.length < this.best_overall_length || !new_champion)
                            ms = 1;
                        else
                            ms = 55;
                    }
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
                Canvas.draw_sight_lines();
                this.snake.draw();
            }
        }
    }
    Game.apples_on_board = 1;
    Game.generation_size = 3000;
    Game.max_generation = 1000;
    return Game;
})();
export { Game };
var newgame = new Game();
newgame.init();
