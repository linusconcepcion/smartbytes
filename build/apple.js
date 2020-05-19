import { Position } from './position.js';
import { Canvas } from './canvas.js';
export class Apple {
    constructor(pos) {
        this.position = Position.copy(pos);
    }
    draw() {
        Canvas.drawTileCircle(this.position, "#FF0000");
    }
}
