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
import { Direction, GameKey, Speed } from "./enum.js";
import { Apple } from "./apple.js";
import { Position } from "./position.js";
import { Brain } from "./ai/brain.js";
let Game = /** @class */ (() => {
    class Game {
        constructor() {
            this.speed = Speed.NORMAL;
            this.has_moved = false;
        }
        init() {
            Canvas.init(document.querySelector("canvas"));
            this.start_training(2000);
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
        start_training(snakeCount) {
            return __awaiter(this, void 0, void 0, function* () {
                var generation = 1;
                let body = document.querySelector("body");
                body.onkeyup = this.on_key_up.bind(this);
                var lastgen = null;
                while (generation < 10000) {
                    document.querySelector("#generation_num").textContent = generation.toString();
                    var bestlength = 0;
                    var bestscore = 0;
                    var newgen = new Array();
                    for (var i = 0; i < snakeCount; i++) {
                        document.querySelector("#snake_num").textContent = (i + 1).toString() + " of " + snakeCount.toString();
                        var newsnake = this.spawn_snake(lastgen);
                        newgen.push(newsnake);
                        yield this.play_game(newsnake);
                        var score = newsnake.calculate_score();
                        var length = newsnake.length;
                        if (length > bestlength) {
                            bestlength = length;
                            document.querySelector("#best_length").textContent = bestlength.toString();
                        }
                        if (score > bestscore) {
                            bestscore = score;
                            document.querySelector("#best_score").textContent = bestscore.toString();
                        }
                        if (this.best_snake == null || score > this.best_snake.score) {
                            this.best_snake = newsnake;
                            document.querySelector("#best_overall_score").textContent = newsnake.length.toString();
                            document.querySelector("#best_weights").value = JSON.stringify(newsnake.brain.weights);
                        }
                    }
                    lastgen = this.top_half(newgen);
                    this.set_mating_pct(lastgen);
                    generation++;
                }
            });
        }
        spawn_snake(lastgen) {
            var spawnrandom = Math.floor(Math.random() * 10) == 1; // 10% of snakes will be random spawns
            var smarty = false; //Math.floor(Math.random() * 25) == 1;
            var brain = new Brain(this);
            if (lastgen == null && smarty) {
                brain.spawn_smarty();
            }
            else if (lastgen == null || spawnrandom) {
                brain.randomize();
            }
            else {
                this.spawn_from(brain, lastgen);
            }
            return new Snake(this, Math.floor(Canvas.MAP_WIDTH / 2) + 1, Math.floor(Canvas.MAP_HEIGHT / 2), 4, Direction.RIGHT, "#e3691c", brain);
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
        set_mating_pct(generation) {
            var total = 0.0;
            for (var snake of generation)
                total += snake.score;
            for (var snake of generation)
                snake.mating_pct = (snake.score / total) * 100;
        }
        spawn_from(brain, generation) {
            var mom = this.natural_selection(generation);
            var shouldmate = Math.floor(Math.random() * 2) == 1;
            if (shouldmate) {
                var pop = this.natural_selection(generation);
                brain.cross_over(mom.brain, pop.brain);
            }
            else {
                brain.clone(mom.brain);
            }
        }
        natural_selection(generation) {
            var rnd = Math.random() * 100;
            var total = 0.0;
            for (var snake of generation) {
                total += snake.mating_pct;
                if (total > rnd)
                    return snake;
            }
            return generation[generation.length - 1]; // just return the last snake
        }
        play_game(newsnake) {
            return __awaiter(this, void 0, void 0, function* () {
                this.snake = newsnake;
                this.apples = [];
                for (var i = 0; i < Game.appleCount; i++)
                    this.spawn_apple();
                while (!newsnake.is_dead) {
                    if (this.speed != Speed.PAUSED) {
                        var direction = this.snake.think();
                        this.do_move(direction);
                    }
                    var ms = 30;
                    if (this.speed == Speed.FAST)
                        ms = 1;
                    else if (this.speed == Speed.SLOW)
                        ms = 65;
                    if (ms > 0)
                        yield this.sleep(ms);
                }
            });
        }
        spawn_apple() {
            while (true) {
                var x = Math.round((Math.random() * (Canvas.MAP_WIDTH - 1))) + 1;
                var y = Math.round((Math.random() * (Canvas.MAP_HEIGHT - 1))) + 1;
                var trypos = new Position(x, y);
                if (!this.snake.is_on_tile(trypos) && this.is_apple_on_tile(trypos) == -1) {
                    this.apples.push(new Apple(trypos));
                    break;
                }
            }
        }
        is_apple_on_tile(pos) {
            return this.is_apple_on_tile_xy(pos.X, pos.Y);
        }
        is_apple_on_tile_xy(x, y) {
            for (var i = 0; i < this.apples.length; i++) {
                if (this.apples[i].position.X == x && this.apples[i].position.Y == y) {
                    return i;
                }
            }
            return -1;
        }
        do_move(direction) {
            this.snake.move(direction);
            if (this.snake.is_dead) {
                if (this.clock != null)
                    this.clock.stop();
                return;
            }
            var appleindex = this.is_apple_on_tile(this.snake.head.position);
            if (appleindex != -1) {
                this.apples.splice(appleindex, 1); // remove one item
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
    Game.appleCount = 8;
    return Game;
})();
export { Game };
var newgame = new Game();
newgame.init();
