import { Position } from './position.js'
import { Direction } from './enum.js'
import { IDrawable } from './idrawable.js';
import { Canvas } from './canvas.js';
import { Snake } from './snake.js';
import { Board } from './board.js';

export class SnakeSegment implements IDrawable {
    
    constructor(snake: Snake, pos: Position, direction: Direction)
    {
        this.snake = snake;

        this.position = Position.copy(pos);
        this.direction = direction;

        Board.set_snake(pos.X, pos.Y);
        
        this.tail = null;
    }

    public snake: Snake;

    public position: Position;
    public direction: Direction;

    public tail: SnakeSegment;

    public draw() 
    {
        Canvas.draw_tile_square(this.position, this.snake.color)
    }
}