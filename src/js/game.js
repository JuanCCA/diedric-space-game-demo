class Game {
    constructor() {
        this.canvasTop = document.getElementById('canvasTop');
        this.canvasSide = document.getElementById('canvasSide');
        this.ctxTop = this.canvasTop.getContext('2d');
        this.ctxSide = this.canvasSide.getContext('2d');
        
        this.ship = new Ship();
        this.controls = new Controls(this.ship);
        
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

    drawGrid(ctx) {
        const gridSize = 50;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.strokeStyle = '#1a1a1a';
        ctx.beginPath();
        
        // Vertical lines
        for(let x = width/2; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.moveTo(width - x, 0);
            ctx.lineTo(width - x, height);
        }
        
        // Horizontal lines
        for(let y = height/2; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.moveTo(0, height - y);
            ctx.lineTo(width, height - y);
        }
        
        ctx.stroke();
    }

    updateUI() {
        document.getElementById('speedX').textContent = this.ship.velocity.x.toFixed(2);
        document.getElementById('speedY').textContent = this.ship.velocity.y.toFixed(2);
        document.getElementById('speedZ').textContent = this.ship.velocity.z.toFixed(2);
        document.getElementById('posX').textContent = this.ship.position.x.toFixed(2);
        document.getElementById('posY').textContent = this.ship.position.y.toFixed(2);
        document.getElementById('posZ').textContent = this.ship.position.z.toFixed(2);
    }

    animate() {
        // Clear canvases
        this.ctxTop.clearRect(0, 0, this.canvasTop.width, this.canvasTop.height);
        this.ctxSide.clearRect(0, 0, this.canvasSide.width, this.canvasSide.height);

        // Draw grid
        this.drawGrid(this.ctxTop);
        this.drawGrid(this.ctxSide);

        // Update controls and ship
        this.controls.update();
        this.ship.update();

        // Draw ship
        this.ship.draw(this.ctxTop, 'top');
        this.ship.draw(this.ctxSide, 'side');

        // Update UI
        this.updateUI();

        requestAnimationFrame(() => this.animate());
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
});