class Controls {
    constructor(ship, game = null) {
        this.ship = ship;
        this.game = game;
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            q: false,
            e: false,
            '+': false,
            '-': false,
            'c': false
        };
        this.force = 0.5;
        this.cKeyPressed = false;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
        }
        // Handle special keys
        if (event.key === '=' || event.key === '+') {
            this.keys['+'] = true;
        }
        if (event.key === '-' || event.key === '_') {
            this.keys['-'] = true;
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
        // Handle special keys
        if (event.key === '=' || event.key === '+') {
            this.keys['+'] = false;
        }
        if (event.key === '-' || event.key === '_') {
            this.keys['-'] = false;
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

        // Camera controls
        if (this.game && this.game.camera) {
            // Zoom controls
            if (this.keys['+']) {
                this.game.camera.scale = Math.min(this.game.camera.scale * 1.02, 3);
            }
            if (this.keys['-']) {
                this.game.camera.scale = Math.max(this.game.camera.scale * 0.98, 0.2);
            }
            // Toggle camera follow (only on key press, not hold)
            if (this.keys['c'] && !this.cKeyPressed) {
                this.game.camera.followShip = !this.game.camera.followShip;
                this.cKeyPressed = true;
            } else if (!this.keys['c']) {
                this.cKeyPressed = false;
            }
        }
    }
}