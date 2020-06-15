import { Position } from './position.js'
import { IDrawable } from './idrawable.js';
import { Canvas } from './canvas.js';
import { Board } from './board.js';

export class Apple implements IDrawable {
    constructor(pos: Position) {
        this.position = Position.copy(pos);

        Board.set_apple(pos.X, pos.Y);
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

        Canvas.draw_tile_circle(this.position, "#FF0000");
    }
}