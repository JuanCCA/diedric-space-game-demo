class Controls {
    constructor(ship) {
        this.ship = ship;
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            q: false,
            e: false
        };
        this.force = 0.5;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = true;
        }
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    update() {
        // Forward/Backward (Y axis)
        if (this.keys.w) this.ship.applyForce(0, -this.force, 0);
        if (this.keys.s) this.ship.applyForce(0, this.force, 0);

        // Left/Right (X axis)
        if (this.keys.a) this.ship.applyForce(-this.force, 0, 0);
        if (this.keys.d) this.ship.applyForce(this.force, 0, 0);

        // Up/Down (Z axis)
        if (this.keys.q) this.ship.applyForce(0, 0, -this.force);
        if (this.keys.e) this.ship.applyForce(0, 0, this.force);
    }
}