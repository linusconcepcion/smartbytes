export class Position {

    constructor(
        public X: number,
        public Y: number
    ) {}

    public static copy(pos: Position) {
        return new Position(pos.X, pos.Y);
    }

    public equals(pos: Position) {
        return this.X == pos.X && this.Y == pos.Y;
    }
}