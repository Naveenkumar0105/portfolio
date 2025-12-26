const canvas = document.getElementById("magic-cursor");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Resize canvas on window resize
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

const particles = [];
const settings = {
    particleCount: 3, // Particles per frame
    gravity: 0.05,
    colors: ["#d4af37", "#f5e6d3", "#ffec8b", "#ffd700"] // Gold shades
};

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 3 + 1;
        this.life = 1.0; // Opacity/Life
        this.decay = Math.random() * 0.03 + 0.02;
        this.color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += settings.gravity; // Gravity effect
        this.life -= this.decay;
        this.size *= 0.95; // Shrink
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let isMoving = false;

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    // Spawn particles on move
    for (let i = 0; i < settings.particleCount; i++) {
        particles.push(new Particle(mouseX, mouseY));
    }
});

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animate);
}

animate();
