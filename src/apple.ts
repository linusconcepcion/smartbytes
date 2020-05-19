import { Position } from './position.js'
import { IDrawable } from './idrawable.js';
import { Canvas } from './canvas.js';

export class Apple implements IDrawable {
    constructor(pos: Position) {
        this.position = Position.copy(pos);
    }

    public position: Position;

    public draw() {
        Canvas.drawTileCircle(this.position, "#FF0000");
    }
}