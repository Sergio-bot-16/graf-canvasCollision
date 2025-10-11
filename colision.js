const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "rgba(136, 156, 255, 1)";

// Función para verificar posición válida
function isValidPosition(x, y, radius, circles) {
    for (let circle of circles) {
        const distance = Math.sqrt(
            Math.pow(x - circle.posX, 2) + 
            Math.pow(y - circle.posY, 2)
        );
        if (distance < (radius + circle.radius)) {
            return false;
        }
    }
    return true;
}

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color;
        this.currentColor = color;
        this.text = text;
        this.speed = speed;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() > 0.5 ? 1 : -1) * this.speed;
        this.isColliding = false;
        this.collisionFlashTimer = 0;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.currentColor;
        context.fillStyle = this.currentColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        
        if (this.isColliding) {
            context.fill();
        } else {
            context.stroke();
        }
        
        context.closePath();
    }

    isCollidingWith(otherCircle) {
        const distance = Math.sqrt(
            Math.pow(this.posX - otherCircle.posX, 2) + 
            Math.pow(this.posY - otherCircle.posY, 2)
        );
        return distance <= (this.radius + otherCircle.radius);
    }

    // Método para calcular el rebote elástico entre dos círculos
    calculateBounce(otherCircle) {
        // Vector entre los centros
        const dx = otherCircle.posX - this.posX;
        const dy = otherCircle.posY - this.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Vector normalizado de colisión
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Producto punto de la velocidad con la normal
        const p1 = this.dx * nx + this.dy * ny;
        const p2 = otherCircle.dx * nx + otherCircle.dy * ny;
        
        // Conservación del momento (masas iguales para simplicidad)
        const optimizedP = (2.0 * (p1 - p2)) / 2;
        
        // Nuevas velocidades
        this.dx = this.dx - optimizedP * nx;
        this.dy = this.dy - optimizedP * ny;
        otherCircle.dx = otherCircle.dx + optimizedP * nx;
        otherCircle.dy = otherCircle.dy + optimizedP * ny;
        
        // Activar efecto flash en ambos círculos
        this.activateCollisionFlash();
        otherCircle.activateCollisionFlash();
    }

    // Método para activar el efecto flash azul
    activateCollisionFlash() {
        this.currentColor = "#0000FF";
        this.isColliding = true;
        this.collisionFlashTimer = 10; // 10 frames de duración
    }

    // Método para actualizar el temporizador del flash
    updateCollisionFlash() {
        if (this.collisionFlashTimer > 0) {
            this.collisionFlashTimer--;
            if (this.collisionFlashTimer === 0) {
                this.currentColor = this.originalColor;
                this.isColliding = false;
            }
        }
    }

    update(context, circles) {
        this.draw(context);
        this.updateCollisionFlash(); // Actualizar efecto flash
        
        // Guardar posición original
        const originalX = this.posX;
        const originalY = this.posY;
        
        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;
        
        // Detectar y manejar colisiones con otros círculos
        let collisionDetected = false;
        for (let otherCircle of circles) {
            if (otherCircle !== this && this.isCollidingWith(otherCircle)) {
                collisionDetected = true;
                
                // Solo procesar la colisión una vez (evitar doble procesamiento)
                if (!this.isColliding && !otherCircle.isColliding) {
                    this.calculateBounce(otherCircle);
                }
                break;
            }
        }
        
        // Rebotar en los bordes del canvas
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
            this.activateCollisionFlash(); // Flash también en bordes
        }
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
            this.activateCollisionFlash(); // Flash también en bordes
        }
    }
}

let circles = [];

function generateCircles(n) {
    const maxAttempts = 100;
    
    for (let i = 0; i < n; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, y, radius;
        
        while (!validPosition && attempts < maxAttempts) {
            radius = Math.random() * 30 + 20;
            x = Math.random() * (window_width - radius * 2) + radius;
            y = Math.random() * (window_height - radius * 2) + radius;
            
            validPosition = isValidPosition(x, y, radius, circles);
            attempts++;
        }
        
        if (!validPosition) {
            radius = Math.random() * 30 + 20;
            x = Math.random() * (window_width - radius * 2) + radius;
            y = Math.random() * (window_height - radius * 2) + radius;
        }
        
        let color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        let speed = Math.random() * 2 + 0.5;
        let text = `C${i + 1}`;
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => {
        circle.update(ctx, circles);
    });
    requestAnimationFrame(animate);
}

generateCircles(15);
animate();