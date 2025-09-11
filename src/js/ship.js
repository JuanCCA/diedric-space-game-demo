class Ship {
    constructor(x = 0, y = 0, z = 0) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.maxSpeed = 5;
        this.friction = 0.98;
        this.size = 10;
    }

    update() {
        if (this.orbitingPlanet) {
            // --- ORBIT MODE ---
            this.orbitAngle += this.orbitSpeed;

            this.position.x = this.orbitingPlanet.position.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.position.y = this.orbitingPlanet.position.y + Math.sin(this.orbitAngle) * this.orbitRadius;
            this.position.z = this.orbitingPlanet.position.z; // órbita en plano XY por simplicidad

        } else {
            // --- NORMAL MODE ---
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
            this.velocity.z += this.acceleration.z;

            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.z *= this.friction;

            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxSpeed), -this.maxSpeed);
            this.velocity.y = Math.max(Math.min(this.velocity.y, this.maxSpeed), -this.maxSpeed);
            this.velocity.z = Math.max(Math.min(this.velocity.z, this.maxSpeed), -this.maxSpeed);

            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.position.z += this.velocity.z;

            this.acceleration = { x: 0, y: 0, z: 0 };
        }
    }

    engageOrbit(planet) {
        const dx = this.position.x - planet.position.x;
        const dy = this.position.y - planet.position.y;
        this.orbitRadius = Math.sqrt(dx*dx + dy*dy);
        this.orbitAngle = Math.atan2(dy, dx);

        // sincronizar velocidad orbital con planeta
        this.orbitSpeed = 0.02 + planet.orbitalSpeed;

        this.orbitingPlanet = planet;
    }

    disengageOrbit() {
        if (this.orbitingPlanet) {
            // Le damos velocidad tangencial al soltar
            this.velocity.x = -Math.sin(this.orbitAngle) * this.orbitRadius * this.orbitSpeed;
            this.velocity.y =  Math.cos(this.orbitAngle) * this.orbitRadius * this.orbitSpeed;
            this.velocity.z = 0;

            this.orbitingPlanet = null;
        }
    }

    draw(ctx, view = 'top', camera = null) {
        ctx.save();
        
        if (camera) {
            // Draw ship relative to camera position
            const screenX = ctx.canvas.width / 2 + (this.position.x - camera.x) * camera.scale;
            const screenY = ctx.canvas.height / 2 + (view === 'top' ? 
                (this.position.y - camera.y) : (this.position.z - camera.z)) * camera.scale;
            ctx.translate(screenX, screenY);
        } else {
            // Original positioning (centered)
            ctx.translate(ctx.canvas.width / 2 + this.position.x, 
                         ctx.canvas.height / 2 + (view === 'top' ? this.position.y : this.position.z));
        }
        
        ctx.beginPath();
        if (view === 'top') {
            // Draw triangle for top view
            ctx.moveTo(0, -this.size/2);
            ctx.lineTo(-this.size/2, this.size/2);
            ctx.lineTo(this.size/2, this.size/2);
        } else {
            // Draw rectangle for side view
            ctx.rect(-this.size/2, -this.size/4, this.size, this.size/2);
        }
        ctx.closePath();
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fill();
        ctx.restore();
    }

    applyForce(x, y, z) {
        this.acceleration.x += x;
        this.acceleration.y += y;
        this.acceleration.z += z;
    }
}