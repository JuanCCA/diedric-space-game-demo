class Controls {
    constructor(ship, game = null) {
        this.ship = ship;
        this.game = game;
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            arrowdown: false,
            arrowup: false,
            '+': false,
            '-': false,
            'c': false,
            ' ': false
        };
        this.force = 0.5;
        this.cKeyPressed = false;
        this.spacePressed = false;

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
        if (event.key === ' ') this.keys[' '] = true;
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
        if (event.key === ' ') this.keys[' '] = false;

    }

    update() {
        const planets = this.game ? this.game.planets : [];
        // 🚀 Movimiento libre
        if (!this.ship.orbitingPlanet) { 
            if (this.keys.w) this.ship.applyForce(0, -this.force, 0);
            if (this.keys.s) this.ship.applyForce(0, this.force, 0);

            if (this.keys.a) this.ship.applyForce(-this.force, 0, 0);
            if (this.keys.d) this.ship.applyForce(this.force, 0, 0);

            if (this.keys.arrowup) this.ship.applyForce(0, 0, -this.force);
            if (this.keys.arrowdown) this.ship.applyForce(0, 0, this.force);
        }

        // 🎥 Cámara
        if (this.game && this.game.camera) {
            if (this.keys['+']) this.game.camera.scale = Math.min(this.game.camera.scale * 1.02, 3);
            if (this.keys['-']) this.game.camera.scale = Math.max(this.game.camera.scale * 0.98, 0.2);

            if (this.keys['c'] && !this.cKeyPressed) {
                this.game.camera.followShip = !this.game.camera.followShip;
                this.cKeyPressed = true;
            } else if (!this.keys['c']) {
                this.cKeyPressed = false;
            }
        }

        // 🌌 Órbita con Espacio
        if (this.keys[' '] && !this.spacePressed) {
            this.spacePressed = true;

            if (this.ship.orbitingPlanet) {
                // Ya está en órbita → salir
                this.ship.disengageOrbit();
            } else {
                console.log('Intentando entrar en órbita...', planets);
                // Buscar planeta cercano
                for (let planet of planets) {
                    const dx = this.ship.position.x - planet.position.x;
                    const dy = this.ship.position.y - planet.position.y;
                    const dz = this.ship.position.z - planet.position.z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (distance < planet.radius * 5) {
                        this.ship.engageOrbit(planet);
                        break;
                    }
                }
            }
        } else if (!this.keys[' ']) {
            this.spacePressed = false;
        }
    }
}