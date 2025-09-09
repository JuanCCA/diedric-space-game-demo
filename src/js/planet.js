class Planet {
    constructor(config) {
        // Propiedades básicas del planeta
        this.name = config.name || 'Unknown Planet';
        this.radius = config.radius || 10;
        this.color = config.color || '#888888';
        
        // Sistema orbital
        this.star = config.star || { x: 0, y: 0, z: 0 }; // Posición de la estrella (centro orbital)
        this.orbitalRadius = config.orbitalRadius || 200; // Distancia de la órbita
        this.orbitalSpeed = config.orbitalSpeed || 0.01; // Velocidad angular (rad/frame)
        this.orbitalAngle = config.orbitalAngle || 0; // Ángulo inicial en radianes
        this.inclination = config.inclination || 0; // Inclinación orbital en radianes
        
        // Rotación propia del planeta
        this.rotationSpeed = config.rotationSpeed || 0.05;
        this.rotationAngle = 0;
        
        // Posición calculada
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        
        // Calcular posición inicial
        this.updatePosition();
        
        // Propiedades adicionales
        this.type = config.type || 'planet'; // 'planet', 'moon', 'station', etc.
        this.hasRings = config.hasRings || false;
        this.ringColor = config.ringColor || '#cccccc';
        this.ringRadius = config.ringRadius || this.radius * 2;
        
        // Trail orbital (rastro de la órbita)
        this.showTrail = config.showTrail !== false; // Por defecto true
        this.trailPoints = [];
        this.maxTrailLength = 100;
    }

    update() {
        // Guardar posición anterior para calcular velocidad
        const prevPosition = { ...this.position };
        
        // Actualizar ángulo orbital
        this.orbitalAngle += this.orbitalSpeed;
        
        // Mantener el ángulo en el rango 0-2π
        if (this.orbitalAngle > Math.PI * 2) {
            this.orbitalAngle -= Math.PI * 2;
        }
        
        // Actualizar posición orbital
        this.updatePosition();
        
        // Calcular velocidad basada en el cambio de posición
        this.velocity.x = this.position.x - prevPosition.x;
        this.velocity.y = this.position.y - prevPosition.y;
        this.velocity.z = this.position.z - prevPosition.z;
        
        // Actualizar rotación propia
        this.rotationAngle += this.rotationSpeed;
        if (this.rotationAngle > Math.PI * 2) {
            this.rotationAngle -= Math.PI * 2;
        }
        
        // Actualizar trail orbital
        this.updateTrail();
    }

    updatePosition() {
        // Calcular posición en órbita elíptica (simplificada como circular)
        const x = Math.cos(this.orbitalAngle) * this.orbitalRadius;
        const y = Math.sin(this.orbitalAngle) * this.orbitalRadius;
        
        // Aplicar inclinación orbital (rotación en eje X)
        const yInclined = y * Math.cos(this.inclination);
        const zInclined = y * Math.sin(this.inclination);
        
        // Posición final relativa a la estrella
        this.position.x = this.star.x + x;
        this.position.y = this.star.y + yInclined;
        this.position.z = this.star.z + zInclined;
    }

    updateTrail() {
        if (!this.showTrail) return;
        
        // Añadir posición actual al trail
        this.trailPoints.push({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        });
        
        // Limitar la longitud del trail
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.shift();
        }
    }

    draw(ctx, view, camera) {
        // Calcular posición en pantalla
        const screenX = ctx.canvas.width / 2 + (this.position.x - camera.x) * camera.scale;
        const screenY = ctx.canvas.height / 2 + (view === 'top' ? 
            (this.position.y - camera.y) : (this.position.z - camera.z)) * camera.scale;
        
        const scaledRadius = this.radius * camera.scale;
        
        // Solo dibujar si está visible
        if (screenX > -scaledRadius && screenX < ctx.canvas.width + scaledRadius &&
            screenY > -scaledRadius && screenY < ctx.canvas.height + scaledRadius) {
            
            // Dibujar trail orbital primero (detrás del planeta)
            this.drawTrail(ctx, view, camera);
            
            ctx.save();
            ctx.translate(screenX, screenY);
            
            // Dibujar anillos si los tiene
            if (this.hasRings) {
                this.drawRings(ctx, camera.scale);
            }
            
            // Dibujar el planeta
            ctx.beginPath();
            ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            
            // Borde del planeta
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = Math.max(1, camera.scale);
            ctx.stroke();
            
            // Dibujar nombre
            this.drawLabel(ctx, scaledRadius, camera.scale);
            
            
            ctx.restore();
        }
    }

    drawTrail(ctx, view, camera) {
    // Skip drawing if disabled or too few points
    if (!this.showTrail || this.trailPoints.length < 2) return;

    // If zoomed out a lot, skip drawing heavy trails to save pixels
    if (camera.scale < 0.3) return;
        
        ctx.save();
        ctx.strokeStyle = `${this.color}40`; // Color del planeta con transparencia
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < this.trailPoints.length; i++) {
            const point = this.trailPoints[i];
            const screenX = ctx.canvas.width / 2 + (point.x - camera.x) * camera.scale;
            const screenY = ctx.canvas.height / 2 + (view === 'top' ? 
                (point.y - camera.y) : (point.z - camera.z)) * camera.scale;
            
            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        }
        
        ctx.stroke();
        ctx.restore();
    }

    drawRings(ctx, scale) {
        const ringRadius = this.ringRadius * scale;
        
        ctx.save();
        ctx.strokeStyle = this.ringColor;
        ctx.lineWidth = Math.max(1, scale * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Anillo interior
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    drawLabel(ctx, scaledRadius, scale) {
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(this.name, 0, scaledRadius + 15 * scale);
        ctx.shadowBlur = 0;
    }


    // Métodos utilitarios
    getDistanceToStar() {
        const dx = this.position.x - this.star.x;
        const dy = this.position.y - this.star.y;
        const dz = this.position.z - this.star.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getOrbitalVelocity() {
        return Math.sqrt(
            this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2
        );
    }

    getPeriod() {
        // Período orbital en frames (tiempo para completar una órbita)
        return (Math.PI * 2) / Math.abs(this.orbitalSpeed);
    }
}
