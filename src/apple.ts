import { Position } from './position.js'
import { IDrawable } from './idrawable.js';
import { Canvas } from './canvas.js';

export class Apple implements IDrawable {
    constructor(pos: Position) {
        this.position = Position.copy(pos);
    }

    public position: Position;
    public eaten: boolean = false;
    public played: boolean = true;

    public is_visible() 
    { 
        return !this.eaten && this.played;
    }

    public draw() {
        if (!this.is_visible())
            return;

        Canvas.drawTileCircle(this.position, "#FF0000");
    }
}