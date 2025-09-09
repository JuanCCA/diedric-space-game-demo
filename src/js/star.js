class Star {
    constructor(config) {
        this.name = config.name || 'Sun';
        this.position = config.position || { x: 0, y: 0, z: 0 };
        this.radius = config.radius || 40;
        this.color = config.color || '#ffff00';
        this.coreColor = config.coreColor || '#ffffff';
        
        // Efectos de la estrella
        this.pulseSpeed = config.pulseSpeed || 0.02;
        this.pulseIntensity = config.pulseIntensity || 0.3;
        this.pulsePhase = 0;
        
        // Rayos de luz
        this.rays = [];
        this.numRays = 8;
        this.rayLength = this.radius * 2;
        this.rayRotation = 0;
        this.rayRotationSpeed = 0.01;
        
        // Generar rayos iniciales
        for (let i = 0; i < this.numRays; i++) {
            this.rays.push({
                angle: (i / this.numRays) * Math.PI * 2,
                length: this.rayLength + Math.random() * 10
            });
        }
        
        // Propiedades de luz/influencia gravitacional
        this.lightRadius = config.lightRadius || 200;
        this.gravitationalInfluence = config.gravitationalInfluence || 1000;
        
        // Tipo de estrella
        this.type = config.type || 'main-sequence';
        this.temperature = config.temperature || 5778; // Kelvin (como el Sol)

        // Cache para recursos render (gradients) por scale
        this._cache = {
            haloGradients: new Map(),
            rayGradients: new Map(),
            coreGradients: new Map()
        };
    }

    update() {
        // Actualizar pulso
        this.pulsePhase += this.pulseSpeed;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
        
        // Rotar rayos de luz
        this.rayRotation += this.rayRotationSpeed;
        if (this.rayRotation > Math.PI * 2) {
            this.rayRotation -= Math.PI * 2;
        }
        
        // Actualizar longitud de rayos aleatoriamente para efecto dinámico
        this.rays.forEach(ray => {
            ray.length += (Math.random() - 0.5) * 2;
            ray.length = Math.max(this.rayLength * 0.8, Math.min(this.rayLength * 1.5, ray.length));
        });
    }

    draw(ctx, view, camera) {
        const screenX = ctx.canvas.width / 2 + (this.position.x - camera.x) * camera.scale;
        const screenY = ctx.canvas.height / 2 + (view === 'top' ? 
            (this.position.y - camera.y) : (this.position.z - camera.z)) * camera.scale;
        
        const scaledRadius = this.radius * camera.scale;
        
        // Solo dibujar si está visible
        if (screenX > -scaledRadius * 2 && screenX < ctx.canvas.width + scaledRadius * 2 &&
            screenY > -scaledRadius * 2 && screenY < ctx.canvas.height + scaledRadius * 2) {
            
            ctx.save();
            ctx.translate(screenX, screenY);
            
            // Dibujar rayos de luz primero (detrás de la estrella)
            this.drawRays(ctx, camera.scale);
            
            // Dibujar halo/corona
            this.drawHalo(ctx, camera.scale);
            
            // Dibujar el núcleo de la estrella
            this.drawCore(ctx, camera.scale);
            
            // Dibujar nombre
            this.drawLabel(ctx, scaledRadius, camera.scale);
            
            ctx.restore();
        }
    }

    drawRays(ctx, scale) {
        ctx.save();
        ctx.rotate(this.rayRotation);
        // Cache gradient per integer scale to avoid allocations
        const key = Math.max(1, Math.round(scale * 100));
        let gradient = this._cache.rayGradients.get(key);
        if (!gradient) {
            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.rayLength * scale);
            gradient.addColorStop(0, `${this.color}80`);
            gradient.addColorStop(1, `${this.color}00`);
            this._cache.rayGradients.set(key, gradient);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 * scale;
        
        this.rays.forEach(ray => {
            ctx.save();
            ctx.rotate(ray.angle);
            
            ctx.beginPath();
            ctx.moveTo(this.radius * scale, 0);
            ctx.lineTo(ray.length * scale, 0);
            ctx.stroke();
            
            // Rayos secundarios más delgados
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(this.radius * scale * 1.2, -2 * scale);
            ctx.lineTo(ray.length * scale * 0.7, -2 * scale);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.radius * scale * 1.2, 2 * scale);
            ctx.lineTo(ray.length * scale * 0.7, 2 * scale);
            ctx.stroke();
            
            ctx.restore();
        });
        
        ctx.restore();
    }

    drawHalo(ctx, scale) {
        // Halo externo con pulso
        const pulseRadius = this.radius * (1 + this.pulseIntensity * Math.sin(this.pulsePhase));
        // Cache halo gradient per scale
        const key = Math.max(1, Math.round(scale * 100));
        let gradient = this._cache.haloGradients.get(key);
        if (!gradient) {
            gradient = ctx.createRadialGradient(
                0, 0, this.radius * scale * 0.5,
                0, 0, pulseRadius * scale * 1.5
            );
            gradient.addColorStop(0, `${this.color}60`);
            gradient.addColorStop(0.5, `${this.color}30`);
            gradient.addColorStop(1, `${this.color}00`);
            this._cache.haloGradients.set(key, gradient);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius * scale * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo medio
        const midGradient = ctx.createRadialGradient(
            0, 0, 0,
            0, 0, pulseRadius * scale
        );
        midGradient.addColorStop(0, `${this.color}40`);
        midGradient.addColorStop(1, `${this.color}00`);
        
        ctx.fillStyle = midGradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCore(ctx, scale) {
        const scaledRadius = this.radius * scale;
        const pulseRadius = scaledRadius * (1 + this.pulseIntensity * 0.1 * Math.sin(this.pulsePhase));
        // Cache core gradient per scale
        const key = Math.max(1, Math.round(scale * 100));
        let coreGradient = this._cache.coreGradients.get(key);
        if (!coreGradient) {
            coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius);
            coreGradient.addColorStop(0, this.coreColor);
            coreGradient.addColorStop(0.3, this.color);
            coreGradient.addColorStop(1, `${this.color}cc`);
            this._cache.coreGradients.set(key, coreGradient);
        }

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo interno brillante
        ctx.fillStyle = this.coreColor;
        ctx.beginPath();
        ctx.arc(0, 0, scaledRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Borde suave
        ctx.strokeStyle = `${this.color}aa`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawLabel(ctx, scaledRadius, scale) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(14, 16 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 5;
        ctx.fillText(this.name, 0, scaledRadius + 25 * scale);
        
        // Información adicional
        ctx.font = `${Math.max(10, 12 * scale)}px Arial`;
        ctx.fillText(`${this.type}`, 0, scaledRadius + 40 * scale);
        ctx.shadowBlur = 0;
    }

    // Métodos utilitarios
    getDistanceTo(object) {
        const dx = this.position.x - object.x;
        const dy = this.position.y - object.y;
        const dz = this.position.z - object.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    getLightIntensityAt(position) {
        const distance = this.getDistanceTo(position);
        if (distance > this.lightRadius) return 0;
        
        // Ley del cuadrado inverso para la intensidad de luz
        return Math.max(0, 1 - (distance * distance) / (this.lightRadius * this.lightRadius));
    }

    // Factory methods para diferentes tipos de estrellas
    static createSun(position = { x: 0, y: 0, z: 0 }) {
        return new Star({
            name: 'Sol',
            position: position,
            radius: 40,
            color: '#ffff00',
            coreColor: '#ffffff',
            type: 'G-type main-sequence',
            temperature: 5778,
            lightRadius: 300,
            pulseSpeed: 0.02,
            pulseIntensity: 0.2
        });
    }

    static createRedGiant(position = { x: 0, y: 0, z: 0 }) {
        return new Star({
            name: 'Red Giant',
            position: position,
            radius: 60,
            color: '#ff4500',
            coreColor: '#ffff00',
            type: 'Red giant',
            temperature: 3500,
            lightRadius: 400,
            pulseSpeed: 0.01,
            pulseIntensity: 0.4
        });
    }

    static createBlueStar(position = { x: 0, y: 0, z: 0 }) {
        return new Star({
            name: 'Blue Star',
            position: position,
            radius: 30,
            color: '#4169e1',
            coreColor: '#ffffff',
            type: 'O-type main-sequence',
            temperature: 30000,
            lightRadius: 500,
            pulseSpeed: 0.05,
            pulseIntensity: 0.1
        });
    }
}
