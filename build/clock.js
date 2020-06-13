export class Clock {
    constructor(interval, handler) {
        this.handler = () => { console.log("No clock handler."); };
        this.interval = interval;
        this.handler = handler;
    }
    on_elapsed() {
        if (this.is_paused)
            return;
        this.handler();
    }
    start() {
        this.is_running = true;
        this.handle = window.setInterval(this.on_elapsed.bind(this), this.interval);
    }
    stop() {
        if (!this.is_running)
            return;
        this.is_running = false;
        window.clearInterval(this.handle);
    }
    pause() { this.is_paused = true; }
    resume() { this.is_paused = false; }
    toggle_pause() {
        this.is_paused = !this.is_paused;
    }
}
//# sourceMappingURL=clock.js.map