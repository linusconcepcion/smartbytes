import { Position } from './position.js';
import { Canvas } from './canvas.js';
import { Board } from './board.js';
export class SnakeSegment {
    constructor(snake, pos, direction) {
        this.snake = snake;
        this.position = Position.copy(pos);
        this.direction = direction;
        Board.set_snake(pos.X, pos.Y);
        this.tail = null;
    }
    draw() {
        Canvas.draw_tile_square(this.position, this.snake.color);
    }
}
//# sourceMappingURL=snakesegment.js.map