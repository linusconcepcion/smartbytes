export class Clock {

    private handle: number; // for the windows interval

    private is_running: boolean;
    private is_paused: boolean;

    private interval: number;
    private handler: () => any = () => { console.log("No clock handler."); }

    constructor(interval: number, handler: () => any) {
        this.interval = interval;
        this.handler = handler;
    }

    private on_elapsed() {
        if (this.is_paused)
            return;

        this.handler();
    }

    public start() {
        this.is_running = true;
        this.handle = window.setInterval(this.on_elapsed.bind(this), this.interval);
    }

    public stop() {
        if (!this.is_running)
            return;

        this.is_running = false;
        window.clearInterval(this.handle);
    }

    public pause() { this.is_paused = true; }
    public resume() { this.is_paused = false; }

    public toggle_pause() {
        this.is_paused = !this.is_paused;
    }

}