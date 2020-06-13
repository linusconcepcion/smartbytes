import { Position } from './position.js';
import { Canvas } from './canvas.js';
export class Apple {
    constructor(pos) {
        this.eaten = false;
        this.played = true;
        this.position = Position.copy(pos);
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