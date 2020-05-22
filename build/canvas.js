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
        static drawTileSquare(pos, color) {
            // x and y should be one based
            var boardX = ((pos.X - 1) * Canvas.TILE_WIDTH) + 1;
            var boardY = ((pos.Y - 1) * Canvas.TILE_HEIGHT) + 1;
            Canvas.fill_rect(boardX, boardY, Canvas.TILE_WIDTH - 2, Canvas.TILE_HEIGHT - 2, color);
        }
        static drawTileCircle(pos, color) {
            var centerX = ((pos.X - 1) * Canvas.TILE_WIDTH) + ((Canvas.TILE_WIDTH - 2) / 2);
            var centerY = ((pos.Y - 1) * Canvas.TILE_HEIGHT) + ((Canvas.TILE_HEIGHT - 2) / 2);
            Canvas.context.beginPath();
            Canvas.context.arc(centerX, centerY, ((Canvas.TILE_WIDTH - 2) / 2), 0, 2 * Math.PI, false);
            Canvas.context.fillStyle = color;
            Canvas.context.fill();
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
    return Canvas;
})();
export { Canvas };
