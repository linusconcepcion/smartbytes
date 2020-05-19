export class Position {
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
    static copy(pos) {
        return new Position(pos.X, pos.Y);
    }
    equals(pos) {
        return this.X == pos.X && this.Y == pos.Y;
    }
}
