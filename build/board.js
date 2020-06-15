import { Canvas } from "./canvas.js";
let Board = /** @class */ (() => {
    class Board {
        static initialize() {
            Board.snake_tiles = [];
            Board.apple_tiles = [];
            for (var y = 0; y < Canvas.MAP_HEIGHT; y++) {
                Board.snake_tiles[y] = [];
                Board.apple_tiles[y] = [];
                for (var x = 0; x < Canvas.MAP_WIDTH; x++) {
                    Board.snake_tiles[y][x] = false;
                    Board.apple_tiles[y][x] = false;
                }
            }
            Board.initialized = true;
        }
        static clear() {
            if (!Board.initialized) {
                Board.initialize();
            }
            else {
                for (var y = 0; y < Canvas.MAP_HEIGHT; y++) {
                    for (var x = 0; x < Canvas.MAP_WIDTH; x++) {
                        Board.snake_tiles[y][x] = false;
                        Board.apple_tiles[y][x] = false;
                    }
                }
            }
        }
        static set_snake(x, y) {
            Board.snake_tiles[y - 1][x - 1] = true;
        }
        static set_apple(x, y) {
            Board.apple_tiles[y - 1][x - 1] = true;
        }
        static clear_snake_tile(x, y) {
            Board.snake_tiles[y - 1][x - 1] = false;
        }
        static clear_apple_tile(x, y) {
            Board.apple_tiles[y - 1][x - 1] = false;
        }
        static is_snake_on_tile(x, y) {
            if (x < 1 || x > Canvas.MAP_WIDTH || y < 1 || y > Canvas.MAP_HEIGHT)
                return false;
            return Board.snake_tiles[y - 1][x - 1];
        }
        static is_apple_on_tile(x, y) {
            if (x < 1 || x > Canvas.MAP_WIDTH || y < 1 || y > Canvas.MAP_HEIGHT)
                return false;
            return Board.apple_tiles[y - 1][x - 1];
        }
    }
    Board.initialized = false;
    return Board;
})();
export { Board };
//# sourceMappingURL=board.js.map