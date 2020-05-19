import { Position } from './position.js';
import { Canvas } from './canvas.js';
export class SnakeSegment {
    constructor(snake, pos, direction) {
        this.snake = snake;
        this.position = Position.copy(pos);
        this.direction = direction;
        this.tail = null;
    }
    draw() {
        Canvas.drawTileSquare(this.position, this.snake.color);
    }
}
