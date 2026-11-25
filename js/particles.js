
class SurveillanceNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 65;
        this.mouse = { x: null, y: null, radius: 120 };
        this.radarAngle = 0;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                size: Math.random() * 1.8 + 0.8,
                color: Math.random() > 0.8 ? 'rgba(0, 243, 255, ' : 'rgba(255, 51, 102, ',
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += (dx / dist) * force * 1.5;
                    p.y += (dy / dist) * force * 1.5;
                }
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + p.alpha + ')';
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = p.color + '0.8)';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    const lineAlpha = (1 - dist / 110) * 0.18;
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${lineAlpha})`;
                    this.ctx.lineWidth = 0.75;
                    this.ctx.stroke();
                }
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.surveillanceNetwork = new SurveillanceNetwork('cyber-canvas');
});
