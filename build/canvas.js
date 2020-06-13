let Canvas = /** @class */ (() => {
    class Canvas {
        static init(el) {
            el.height = Canvas.height;
            el.width = Canvas.width;
            Canvas.context = el.getContext("2d");
        }
        static clear() {
            Canvas.fill_rect(0, 0, Canvas.width, Canvas.height, "#000000");
        }
        static draw_tile_square(pos, color) {
            // x and y should be one based
            var boardX = ((pos.X - 1) * Canvas.TILE_WIDTH) + 1;
            var boardY = ((pos.Y - 1) * Canvas.TILE_HEIGHT) + 1;
            Canvas.fill_rect(boardX, boardY, Canvas.TILE_WIDTH - 2, Canvas.TILE_HEIGHT - 2, color);
        }
        static draw_tile_circle(pos, color) {
            var centerX = ((pos.X - 1) * Canvas.TILE_WIDTH) + ((Canvas.TILE_WIDTH - 2) / 2);
            var centerY = ((pos.Y - 1) * Canvas.TILE_HEIGHT) + ((Canvas.TILE_HEIGHT - 2) / 2);
            Canvas.context.beginPath();
            Canvas.context.arc(centerX, centerY, ((Canvas.TILE_WIDTH - 2) / 2), 0, 2 * Math.PI, false);
            Canvas.context.fillStyle = color;
            Canvas.context.fill();
        }
        static draw_sight_line(x, y, color) {
            if (Canvas.sight_lines == null) {
                Canvas.sight_lines = new Array(Canvas.MAP_HEIGHT * Canvas.MAP_WIDTH);
                Canvas.sight_dots = 0;
            }
            var index = ((y - 1) * Canvas.MAP_WIDTH) + (x - 1);
            Canvas.sight_lines[index] = color;
            Canvas.sight_dots++;
            if (Canvas.sight_dots > Canvas.DIAGONAL * 8)
                index = 0;
        }
        static clear_sight_lines() {
            Canvas.sight_lines = null;
            Canvas.sight_dots = 0;
        }
        static draw_sight_lines() {
            for (var y = 0; y < Canvas.MAP_HEIGHT; y++)
                for (var x = 0; x < Canvas.MAP_WIDTH; x++) {
                    var index = (y * Canvas.MAP_WIDTH) + x;
                    var color = Canvas.sight_lines[index];
                    if (color == null)
                        continue;
                    var centerX = (x * Canvas.TILE_WIDTH) + ((Canvas.TILE_WIDTH - 2) / 2);
                    var centerY = (y * Canvas.TILE_HEIGHT) + ((Canvas.TILE_HEIGHT - 2) / 2);
                    Canvas.fill_rect(centerX, centerY, 2, 2, color);
                }
        }
        static fill(color) {
            Canvas.context.beginPath();
            Canvas.context.rect(0, 0, Canvas.width, Canvas.height);
            Canvas.context.fillStyle = color;
            Canvas.context.fill();
        }
        static fill_rect(x, y, w, h, color) {
            Canvas.context.beginPath();
            Canvas.context.fillStyle = color;
            Canvas.context.fillRect(x, y, w, h);
        }
        static draw_rect(x, y, w, h, color) {
            Canvas.context.beginPath();
            Canvas.context.lineWidth = 1;
            Canvas.context.strokeStyle = color;
            Canvas.context.rect(x, y, w, h);
            Canvas.context.stroke();
        }
    }
    Canvas.MAP_WIDTH = 40;
    Canvas.MAP_HEIGHT = 40;
    Canvas.DIAGONAL = Math.min(Canvas.MAP_WIDTH, Canvas.MAP_HEIGHT);
    Canvas.TILE_WIDTH = 16;
    Canvas.TILE_HEIGHT = 16;
    Canvas.width = Canvas.MAP_WIDTH * Canvas.TILE_WIDTH;
    Canvas.height = Canvas.MAP_HEIGHT * Canvas.TILE_HEIGHT;
    Canvas.sight_lines = null;
    return Canvas;
})();
export { Canvas };
//# sourceMappingURL=canvas.js.map