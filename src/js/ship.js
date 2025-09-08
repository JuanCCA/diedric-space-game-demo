class Ship {
    constructor(x = 0, y = 0, z = 0) {
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.maxSpeed = 5;
        this.friction = 0.98;
        this.size = 20;
    }

    update() {
        // Update velocity based on acceleration
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.velocity.z += this.acceleration.z;

        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.z *= this.friction;

        // Limit speed
        this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxSpeed), -this.maxSpeed);
        this.velocity.y = Math.max(Math.min(this.velocity.y, this.maxSpeed), -this.maxSpeed);
        this.velocity.z = Math.max(Math.min(this.velocity.z, this.maxSpeed), -this.maxSpeed);

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // Reset acceleration
        this.acceleration = { x: 0, y: 0, z: 0 };
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