import { Canvas } from "./canvas.js";

export abstract class Board {
    private static snake_tiles: boolean[][];
    private static apple_tiles: boolean[][];

    private static initialized = false;

    private static initialize() {
        Board.snake_tiles = [];
        Board.apple_tiles = [];

        for (var y=0; y<Canvas.MAP_HEIGHT; y++) {
            Board.snake_tiles[y] = [];
            Board.apple_tiles[y] = [];
            for (var x=0; x<Canvas.MAP_WIDTH; x++) {
                Board.snake_tiles[y][x] = false;
                Board.apple_tiles[y][x] = false;
            }
        }

        Board.initialized = true;
    }


    public static clear() {
        if (!Board.initialized) {
            Board.initialize();
        } else {
            for (var y=0; y<Canvas.MAP_HEIGHT; y++) {
                for (var x=0; x<Canvas.MAP_WIDTH; x++) {
                    Board.snake_tiles[y][x] = false;
                    Board.apple_tiles[y][x] = false;
                }
            }
        }
    }

    public static set_snake(x: number, y: number) {
        Board.snake_tiles[y-1][x-1] = true;
    }

    public static set_apple(x: number, y: number) {
        Board.apple_tiles[y-1][x-1] = true;
    }

    public static clear_snake_tile(x: number, y: number) {
        Board.snake_tiles[y-1][x-1] = false;
    }

    public static clear_apple_tile(x: number, y: number) {
        Board.apple_tiles[y-1][x-1] = false;
    }

    public static is_snake_on_tile(x: number, y: number) {
        if (x<1 || x>Canvas.MAP_WIDTH || y<1 || y>Canvas.MAP_HEIGHT)
            return false;

        return Board.snake_tiles[y-1][x-1];        
    }

    public static is_apple_on_tile(x: number, y: number) {
        if (x<1 || x>Canvas.MAP_WIDTH || y<1 || y>Canvas.MAP_HEIGHT)
            return false;

        return Board.apple_tiles[y-1][x-1];
    }
}