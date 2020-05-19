import { Position } from './position.js'

export abstract class Canvas {

    public static MAP_WIDTH: number = 20;
    public static MAP_HEIGHT: number = 20;
    public static DIAGONAL: number = Math.min(Canvas.MAP_WIDTH, Canvas.MAP_HEIGHT);

    private static TILE_WIDTH: number = 20;
    private static TILE_HEIGHT: number = 20;
    private static width: number = Canvas.MAP_WIDTH * Canvas.TILE_WIDTH;
    private static height: number = Canvas.MAP_HEIGHT * Canvas.TILE_HEIGHT;
    private static context: CanvasRenderingContext2D;

    public static init(el: HTMLCanvasElement) {
        el.height = Canvas.height;
        el.width = Canvas.width;
        Canvas.context = el.getContext("2d");
    }

    public static clear() {
        Canvas.fill_rect(0, 0, Canvas.width, Canvas.height, "#000000");
    }

    public static drawTileSquare(pos: Position, color: string) {

        // x and y should be one based
        var boardX = ((pos.X-1) * Canvas.TILE_WIDTH) +1;
        var boardY = ((pos.Y-1) * Canvas.TILE_HEIGHT) +1;

        Canvas.fill_rect(boardX, boardY, Canvas.TILE_WIDTH-2, Canvas.TILE_HEIGHT-2, color);
    }

    public static drawTileCircle(pos: Position, color: string) {

        var centerX = ((pos.X-1) * Canvas.TILE_WIDTH) + ((Canvas.TILE_WIDTH-2) / 2);
        var centerY = ((pos.Y-1) * Canvas.TILE_HEIGHT) + ((Canvas.TILE_HEIGHT-2) / 2);
        Canvas.context.beginPath();
        Canvas.context.arc(centerX, centerY, ((Canvas.TILE_WIDTH-2)/2), 0, 2 * Math.PI, false);
        Canvas.context.fillStyle = color;
        Canvas.context.fill();
        
    }

    public static fill(color: string) {

        Canvas.context.beginPath();
        Canvas.context.rect(0, 0, Canvas.width, Canvas.height);
        Canvas.context.fillStyle = color;
        Canvas.context.fill();            
    }

    public static fill_rect(x: number, y: number, w: number, h: number, color: string) {

        Canvas.context.beginPath();
        Canvas.context.fillStyle = color;
        Canvas.context.fillRect(x, y, w, h);            
    }

    public static draw_rect(x: number, y: number, w: number, h: number, color: string) {

        Canvas.context.beginPath();
        Canvas.context.lineWidth = 1;
        Canvas.context.strokeStyle = color;
        Canvas.context.rect(x, y, w, h);
        Canvas.context.stroke();
    }    

}