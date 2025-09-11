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
        window.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) { // TODO: poder clikar en objetos dentro de los canvas
        const { clientX: x, clientY: y } = event;
        const {heightTopContainer, leftTopContainer, heightBottomContainer, leftBottomContainer} = this.game.containerSizes;

        function isInside(container, x, y) {
        return (
            container.height.init < y && y < container.height.end &&
            container.left.init < x && x < container.left.end
        );
        }


        this.game.planets.forEach(planet => {
            console.log(planet.position.x, planet.position.y);
            console.log(x, y)
        });
        
        if (isInside({ height: heightTopContainer, left: leftTopContainer }, x, y)) {
        console.log('top');
        }

        if (isInside({ height: heightBottomContainer, left: leftBottomContainer }, x, y)) {
        console.log('bottom');
        }
        
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

        if (!this.ship.orbitingPlanet) { 
            if (this.keys.w) this.ship.applyForce(0, -this.force, 0);
            if (this.keys.s) this.ship.applyForce(0, this.force, 0);

            if (this.keys.a) this.ship.applyForce(-this.force, 0, 0);
            if (this.keys.d) this.ship.applyForce(this.force, 0, 0);

            if (this.keys.arrowup) this.ship.applyForce(0, 0, -this.force);
            if (this.keys.arrowdown) this.ship.applyForce(0, 0, this.force);
        }

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

        if (this.keys[' '] && !this.spacePressed) {
            this.spacePressed = true;

            if (this.ship.orbitingPlanet) {
                // Ya está en órbita -> salir
                this.ship.disengageOrbit();
            } else {
                // Buscar planeta cercano
                for (let planet of planets) {
                    const dx = this.ship.position.x - planet.position.x;
                    const dy = this.ship.position.y - planet.position.y;
                    const dz = this.ship.position.z - planet.position.z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    if (distance < planet.radius * 5) {
                        console.log('Orbitando en -> ', planet.name);
                        this.ship.engageOrbit(planet);
                        this.showPlanetInfo(planet);
                        break;
                    }
                }
            }
        } else if (!this.keys[' ']) {
            this.spacePressed = false;
        }
    }

    showPlanetInfo(planet) {
        document.getElementById("planetName").textContent = planet.name || "Planeta sin nombre";
        document.getElementById("planetRadius").textContent = planet.radius || "N/A";
        document.getElementById("planetX").textContent = planet.position.x.toFixed(2);
        document.getElementById("planetY").textContent = planet.position.y.toFixed(2);
        document.getElementById("planetZ").textContent = planet.position.z.toFixed(2);

        document.getElementById("planetInfo").classList.remove("hidden");
    }

    hidePlanetInfo() {
        document.getElementById("planetInfo").classList.add("hidden");
    }

}