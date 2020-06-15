import { Position } from './position.js';
import { Canvas } from './canvas.js';
import { Board } from './board.js';
export class Apple {
    constructor(pos) {
        this.eaten = false;
        this.played = true;
        this.position = Position.copy(pos);
        Board.set_apple(pos.X, pos.Y);
    }
    is_visible() {
        return !this.eaten && this.played;
    }
    draw() {
        if (!this.is_visible())
            return;
        Canvas.draw_tile_circle(this.position, "#FF0000");
    }
}
//# sourceMappingURL=apple.js.map