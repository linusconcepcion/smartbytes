import { Position } from "./position.js";
import { SnakeSegment } from "./snakesegment.js";
import { Direction } from "./enum.js";
import { Canvas } from "./canvas.js";
let Snake = /** @class */ (() => {
    class Snake {
        constructor(game, headX, headY, length, direction, color, brain) {
            this.eat_countdown = Snake.max_moves_to_eat;
            this.steps = 0;
            this.apples = 0;
            // construct the snake on backwards
            var pos = new Position(headX, headY);
            this.color = color;
            this.head = new SnakeSegment(this, pos, direction);
            this.visit(pos);
            this.length = length;
            var counter = this.length;
            var cursegment = this.head;
            while (counter > 1) {
                switch (direction) {
                    case Direction.DOWN:
                        pos.Y = pos.Y - 1;
                        break;
                    case Direction.UP:
                        pos.Y = pos.Y + 1;
                        break;
                    case Direction.LEFT:
                        pos.X = pos.X + 1;
                        break;
                    case Direction.RIGHT:
                        pos.X = pos.X - 1;
                        break;
                }
                var tail = new SnakeSegment(this, pos, direction);
                cursegment.tail = tail;
                cursegment = tail;
                counter--;
            }
            this.tail = cursegment;
            this.is_dead = false;
            this.brain = brain;
            brain.set_snake(this);
        }
        think() {
            var dir = this.brain.process();
            if (this.is_reverse(dir, this.head.direction))
                return this.head.direction; // can't turn on a dime.
            else
                return dir;
        }
        visit(pos) {
            if (this.visited == null) {
                this.visited = [];
                for (var x = 0; x < Canvas.MAP_WIDTH; x++) {
                    this.visited[x] = [];
                    for (var y = 0; y < Canvas.MAP_HEIGHT; y++) {
                        this.visited[x][y] = false;
                    }
                }
            }
            this.visited[pos.X - 1][pos.Y - 1] = true;
        }
        is_reverse(dir1, dir2) {
            return (dir1 == Direction.UP && dir2 == Direction.DOWN) ||
                (dir2 == Direction.UP && dir1 == Direction.DOWN) ||
                (dir1 == Direction.LEFT && dir2 == Direction.RIGHT) ||
                (dir2 == Direction.LEFT && dir1 == Direction.RIGHT);
        }
        eat() {
            this.apples += 1;
            this.length += 1;
            this.eat_countdown = Snake.max_moves_to_eat;
        }
        move(direction) {
            this.eat_countdown--;
            if (this.eat_countdown == 0) {
                this.is_dead = true;
                return false;
            }
            // create a new head, and remove the old tail
            var segment = this.head;
            var pos = Position.copy(segment.position);
            switch (direction) {
                case Direction.DOWN:
                    pos.Y += 1;
                    break;
                case Direction.UP:
                    pos.Y -= 1;
                    break;
                case Direction.LEFT:
                    pos.X -= 1;
                    break;
                case Direction.RIGHT:
                    pos.X += 1;
                    break;
            }
            // check to see if the snake hit the walls
            if (pos.X < 1 || pos.X > Canvas.MAP_WIDTH || pos.Y < 1 || pos.Y > Canvas.MAP_HEIGHT) {
                this.is_dead = true;
                return false;
            }
            var newhead = new SnakeSegment(this, pos, direction);
            newhead.tail = this.head;
            this.head = newhead;
            // now check the links to see if the head hit, and also remove the tail
            var cursegment = this.head.tail;
            var counter = this.length;
            while (counter > 1 && cursegment != null) {
                if (cursegment.position.equals(this.head.position)) {
                    this.is_dead = true;
                    return false;
                }
                counter--;
                if (counter > 1)
                    cursegment = cursegment.tail;
            }
            cursegment.tail = null;
            this.tail = cursegment;
            this.visit(this.head.position);
            this.steps++;
            return true;
        }
        is_on_tile(pos) {
            return this.is_on_tile_xy(pos.X, pos.Y);
        }
        is_on_tile_xy(x, y) {
            var segment = this.head;
            while (segment != null) {
                if (segment.position.X == x && segment.position.Y == y)
                    return true;
                segment = segment.tail;
            }
            return false;
        }
        calculate_score() {
            var cellsvisited = 0;
            for (var x = 0; x < Canvas.MAP_WIDTH; x++) {
                for (var y = 0; y < Canvas.MAP_HEIGHT; y++) {
                    if (this.visited[x][y])
                        cellsvisited++;
                }
            }
            //this.score = this.steps + (Math.pow(2, this.apples) + (Math.pow(this.apples, 2.1) * 500)) - (Math.pow(this.apples, 1.2) * Math.pow((0.25 * this.steps), 1.3));
            this.score = (Math.pow(2, this.apples) * 500) + (cellsvisited * 250) + this.steps;
            return this.score;
        }
        draw() {
            var segment = this.head;
            while (segment != null) {
                segment.draw();
                segment = segment.tail;
            }
        }
    }
    Snake.max_moves_to_eat = 500;
    return Snake;
})();
export { Snake };
