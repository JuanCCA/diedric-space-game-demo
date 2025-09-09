class Game {
    constructor() {
        this.canvasTop = document.getElementById('canvasTop');
        this.canvasSide = document.getElementById('canvasSide');
        this.ctxTop = this.canvasTop.getContext('2d');
        this.ctxSide = this.canvasSide.getContext('2d');
        
        // Camera system for expanded view
        this.camera = {
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            followShip: true
        };
        
        this.ship = new Ship();
        this.controls = new Controls(this.ship, this);
        
        // Create solar system with central star
        this.star = Star.createSun({ x: 0, y: 0, z: 0 });
        
        // Create orbital planets
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
                rotationSpeed: -0.02, // Rotación retrógrada
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
        
        // Performance helpers
        this.animationId = null;
        this.paused = false;
        this.lastUIUpdate = 0;
        this.uiUpdateInterval = 100; // ms

        // Reusable array to avoid allocations each frame
        this._drawables = [];

        this.resize();

        // Debounced resize to avoid thrashing on continuous resize
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.resize(), 150);
        });

        // Pause when tab is hidden to save CPU
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
    // Respect devicePixelRatio for crisp rendering, but cap to limit fill cost
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
            // Smooth camera following
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
        // Backwards-compatible: keep method but delegate to depth-sorted draw per view
        this.drawScene('top', this.ctxTop);
        this.drawScene('side', this.ctxSide);
    }

    // Draw all scene objects for a given view, sorted by depth so closer objects overlap
    drawScene(view, ctx) {
        // Build list of drawables: star, planets, ship
        const drawables = [];

        // Helper to get depth according to view
        const getDepth = (pos) => {
            if (view === 'top') {
                // In top view we project X/Y -> depth is Z
                return (pos.z !== undefined ? pos.z : 0) - this.camera.z;
            } else {
                // In side view we project X/Z -> depth is Y
                return (pos.y !== undefined ? pos.y : 0) - this.camera.y;
            }
        };

        // Star
        if (this.star && this.star.position) {
            drawables.push({ obj: this.star, depth: getDepth(this.star.position) });
        }

        // Planets
        this.planets.forEach(p => drawables.push({ obj: p, depth: getDepth(p.position) }));

        // Ship
        if (this.ship && this.ship.position) {
            drawables.push({ obj: this.ship, depth: getDepth(this.ship.position) });
        }

        // Sort by depth: farthest first (smaller depth value = farther if camera ahead), then draw
        drawables.sort((a, b) => a.depth - b.depth);

        // Draw each object using its own draw method
        drawables.forEach(item => {
            // Some objects may not accept the same signature; assume (ctx, view, camera)
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

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
});