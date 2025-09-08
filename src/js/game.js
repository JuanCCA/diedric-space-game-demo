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
        
        // Add planets to the game world
        this.planets = [
            { name: 'Mercury', x: -300, y: -200, z: 0, radius: 8, color: '#8c7853' },
            { name: 'Venus', x: 400, y: 250, z: -80, radius: 12, color: '#ffc649' },
            { name: 'Earth', x: -500, y: 350, z: 120, radius: 15, color: '#6b93d6' },
            { name: 'Mars', x: 600, y: -300, z: -100, radius: 10, color: '#c1440e' },
            { name: 'Jupiter', x: -700, y: -500, z: 200, radius: 35, color: '#d8ca9d' },
            { name: 'Saturn', x: 800, y: 400, z: -150, radius: 30, color: '#fab27b' },
            { name: 'Station Alpha', x: 200, y: -150, z: 50, radius: 6, color: '#ffffff' }
        ];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.animate();
    }

    resize() {
        this.canvasTop.width = this.canvasTop.clientWidth;
        this.canvasTop.height = this.canvasTop.clientHeight;
        this.canvasSide.width = this.canvasSide.clientWidth;
        this.canvasSide.height = this.canvasSide.clientHeight;
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

    drawPlanets() {
        this.planets.forEach(planet => {
            this.drawPlanet(this.ctxTop, planet, 'top');
            this.drawPlanet(this.ctxSide, planet, 'side');
        });
    }

    drawPlanet(ctx, planet, view) {
        const screenX = ctx.canvas.width / 2 + (planet.x - this.camera.x) * this.camera.scale;
        const screenY = ctx.canvas.height / 2 + (view === 'top' ? 
            (planet.y - this.camera.y) : (planet.z - this.camera.z)) * this.camera.scale;
        
        // Only draw if planet is visible on screen
        if (screenX > -planet.radius && screenX < ctx.canvas.width + planet.radius &&
            screenY > -planet.radius && screenY < ctx.canvas.height + planet.radius) {
            
            ctx.save();
            ctx.translate(screenX, screenY);
            
            // Draw planet
            ctx.beginPath();
            ctx.arc(0, 0, planet.radius * this.camera.scale, 0, Math.PI * 2);
            ctx.fillStyle = planet.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw planet name
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(planet.name, 0, planet.radius * this.camera.scale + 15);
            
            ctx.restore();
        }
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
            const screenX = this.canvasTop.width / 2 + (planet.x - this.camera.x) * this.camera.scale;
            const screenY = this.canvasTop.height / 2 + (planet.y - this.camera.y) * this.camera.scale;
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

        // Draw planets
        this.drawPlanets();

        // Update controls and ship
        this.controls.update();
        this.ship.update();

        // Draw ship with camera offset
        this.ship.draw(this.ctxTop, 'top', this.camera);
        this.ship.draw(this.ctxSide, 'side', this.camera);

        // Update UI
        this.updateUI();

        requestAnimationFrame(() => this.animate());
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
});