class Game {
    constructor() {

        // Canvas
        this.canvasTop = document.getElementById('canvasTop');
        this.canvasSide = document.getElementById('canvasSide');
        this.ctxTop = this.canvasTop.getContext('2d');
        this.ctxSide = this.canvasSide.getContext('2d');
        const { top: topTop, left: leftTop, width: widthTop, height: heightTop } = this.canvasTop.getBoundingClientRect();
        const { top: topBottom, left: leftBottom, width: widthBottom, height: heightBottom } = this.canvasSide.getBoundingClientRect();

        this.containerSizes = {
            heightTopContainer: {
                init: topTop,
                end: topTop + heightTop
            },
    
            leftTopContainer: {
                init: leftTop,
                end: leftTop + widthTop
            },
    
            heightBottomContainer: {
                init: topBottom,
                end: topBottom + heightBottom
            },
    
            leftBottomContainer: {
                init: leftBottom,
                end: leftBottom + widthBottom
            },
        }
        
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            followShip: true
        };
        
        this.ship = new Ship();
        this.controls = new Controls(this.ship, this);
        
        this.star = Star.createSun({ x: 0, y: 0, z: 0 });
        
        this.planets = [
            new Planet({
                name: 'Mercury',
                radius: 6,
                color: '#8c7853',
                star: this.star.position,
                orbitalRadius: 150,
                orbitalSpeed: 0.010,
                orbitalAngle: 0,
                inclination: 0.01,
                rotationSpeed: 0.05,
                showTrail: true
            }),
            new Planet({
                name: 'Venus',
                radius: 10,
                color: '#ffc649',
                star: this.star.position,
                orbitalRadius: 220,
                orbitalSpeed: 0.0075,
                orbitalAngle: Math.PI * 0.3,
                inclination: 0.02,
                rotationSpeed: -0.02, 
                showTrail: true
            }),
            new Planet({
                name: 'Earth',
                radius: 15,
                color: '#6b93d6',
                star: this.star.position,
                orbitalRadius: 300,
                orbitalSpeed: 0.004,
                orbitalAngle: 0,
                inclination: 0.05,
                rotationSpeed: 0.1,
                type: 'planet',
                showTrail: true
            }),
            new Planet({
                name: 'Mars',
                radius: 10,
                color: '#c1440e',
                star: this.star.position,
                orbitalRadius: 450,
                orbitalSpeed: 0.0025,
                orbitalAngle: Math.PI * 0.3,
                inclination: 0.03,
                rotationSpeed: 0.08,
                type: 'planet',
                showTrail: true
            }),
            new Planet({
                name: 'Jupiter',
                radius: 35,
                color: '#d8ca9d',
                star: this.star.position,
                orbitalRadius: 700,
                orbitalSpeed: 0.001,
                orbitalAngle: Math.PI * 1.2,
                inclination: 0.02,
                rotationSpeed: 0.15,
                type: 'planet',
                hasRings: true,
                ringColor: '#f0e68c',
                showTrail: true
            }),
            new Planet({
                name: 'Saturn',
                radius: 30,
                color: '#fab27b',
                star: this.star.position,
                orbitalRadius: 950,
                orbitalSpeed: 0.00075,
                orbitalAngle: Math.PI * 1.8,
                inclination: 0.04,
                rotationSpeed: 0.12,
                type: 'planet',
                hasRings: true,
                ringColor: '#ffd700',
                ringRadius: 45,
                showTrail: true
            }),
            new Planet({
                name: 'Station Alpha',
                radius: 8,
                color: '#ffffff',
                star: this.star.position,
                orbitalRadius: 350,
                orbitalSpeed: 0.010,
                orbitalAngle: Math.PI * 1.5,
                inclination: 0,
                rotationSpeed: 0.1,
                type: 'station',
                hasRings: false,
                showTrail: false
            })
        ];
        
        this.animationId = null;
        this.paused = false;
        this.lastUIUpdate = 0;
        this.uiUpdateInterval = 100; // ms

        this._drawables = [];

        this.resize();

        // Debounce para evitar resizes infinitos
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.resize(), 150);
        });

        // Pausar juego cuando no este en la ventana para ahorrar CPU // TODO: cuando sales y entras de la ventana, el juego se va acelerando
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.paused = true;
                if (this.animationId) cancelAnimationFrame(this.animationId);
            } else {
                if (this.paused) {
                    this.paused = false;
                    this.animate();
                }
            }
        });

        this.animate();
    }

    resize() {
    // Con respecto a ratio pixel
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvasTop.width = Math.round(this.canvasTop.clientWidth * dpr);
    this.canvasTop.height = Math.round(this.canvasTop.clientHeight * dpr);
    this.canvasSide.width = Math.round(this.canvasSide.clientWidth * dpr);
    this.canvasSide.height = Math.round(this.canvasSide.clientHeight * dpr);

    // Keep drawing coordinates in CSS pixels by scaling context
    this.ctxTop.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctxSide.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    updateCamera() {
        if (this.camera.followShip) {
            // Seguimioento suave
            this.camera.x += (this.ship.position.x - this.camera.x) * 0.1;
            this.camera.y += (this.ship.position.y - this.camera.y) * 0.1;
            this.camera.z += (this.ship.position.z - this.camera.z) * 0.1;
        }
    }

    drawGrid(ctx) {
        const gridSize = 50;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Calculate grid offset based on camera position
        const offsetX = (this.camera.x % gridSize) * this.camera.scale;
        const offsetY = (this.camera.y % gridSize) * this.camera.scale;
        
        // Vertical lines
        for(let x = -gridSize; x < width + gridSize; x += gridSize) {
            const drawX = x - offsetX;
            ctx.moveTo(drawX, 0);
            ctx.lineTo(drawX, height);
        }
        
        // Horizontal lines
        for(let y = -gridSize; y < height + gridSize; y += gridSize) {
            const drawY = y - offsetY;
            ctx.moveTo(0, drawY);
            ctx.lineTo(width, drawY);
        }
        
        ctx.stroke();
    }

    drawSolarSystem() {
        this.drawScene('top', this.ctxTop);
        this.drawScene('side', this.ctxSide);
    }

    drawScene(view, ctx) {
        const drawables = [];

        // Tener en cuenta la profundidad y overlaping
        const getDepth = (pos) => {
            if (view === 'top') {
                // En top X/Y -> Z
                return (pos.z !== undefined ? pos.z : 0) - this.camera.z;
            } else {
                // En bottom X/Z -> Y
                return (pos.y !== undefined ? pos.y : 0) - this.camera.y;
            }
        };

        if (this.star && this.star.position) {
            drawables.push({ obj: this.star, depth: getDepth(this.star.position) });
        }

        this.planets.forEach(p => drawables.push({ obj: p, depth: getDepth(p.position) }));

        if (this.ship && this.ship.position) {
            drawables.push({ obj: this.ship, depth: getDepth(this.ship.position) });
        }

        drawables.sort((a, b) => a.depth - b.depth);

        drawables.forEach(item => {
            // Asegura que el draw sea una funcion, por si me paso de listo
            if (typeof item.obj.draw === 'function') {
                item.obj.draw(ctx, view, this.camera);
            }
        });
    }

    updateUI() {
        // Ship stats
        document.getElementById('speedX').textContent = this.ship.velocity.x.toFixed(2);
        document.getElementById('speedY').textContent = this.ship.velocity.y.toFixed(2);
        document.getElementById('speedZ').textContent = this.ship.velocity.z.toFixed(2);
        document.getElementById('posX').textContent = this.ship.position.x.toFixed(2);
        document.getElementById('posY').textContent = this.ship.position.y.toFixed(2);
        document.getElementById('posZ').textContent = this.ship.position.z.toFixed(2);
        
        // Camera stats
        document.getElementById('cameraScale').textContent = this.camera.scale.toFixed(2);
        document.getElementById('cameraFollow').textContent = this.camera.followShip ? 'Sí' : 'No';
        
        // Count visible planets
        let visiblePlanets = 0;
        this.planets.forEach(planet => {
            const screenX = this.canvasTop.width / 2 + (planet.position.x - this.camera.x) * this.camera.scale;
            const screenY = this.canvasTop.height / 2 + (planet.position.y - this.camera.y) * this.camera.scale;
            if (screenX > -planet.radius && screenX < this.canvasTop.width + planet.radius &&
                screenY > -planet.radius && screenY < this.canvasTop.height + planet.radius) {
                visiblePlanets++;
            }
        });
        document.getElementById('planetsCount').textContent = visiblePlanets;
    }

    animate() {
        // Update camera
        this.updateCamera();

        // Clear canvases
        this.ctxTop.clearRect(0, 0, this.canvasTop.width, this.canvasTop.height);
        this.ctxSide.clearRect(0, 0, this.canvasSide.width, this.canvasSide.height);

        // Draw grid
        this.drawGrid(this.ctxTop);
        this.drawGrid(this.ctxSide);

        // Update objects
        this.star.update();
        this.planets.forEach(planet => planet.update());
        this.controls.update();
        this.ship.update();

        // Draw scene per view with depth-sorting so nearer objects overlap farther ones
        this.drawScene('top', this.ctxTop);
        this.drawScene('side', this.ctxSide);

        // Update UI
        this.updateUI();

        requestAnimationFrame(() => this.animate());
    }
}

// Cuando ventana carge empieza el juego
window.addEventListener('load', () => {
    new Game();
});