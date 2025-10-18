// ===============================
//  APP.JS — Juego: Objetos en Caída
// ===============================

// --- CONFIGURACIÓN DEL CANVAS ---
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Ajustar el tamaño del canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- VARIABLES GLOBALES ---
const numObjects = 10;       // número de objetos en pantalla
const objects = [];          // arreglo que almacenará los objetos
let score = 0;               // contador de objetos eliminados
const scoreDisplay = document.getElementById("score"); // referencia al div del contador

// --- CLASE: Objeto en Caída ---
class FallingObject {
  constructor(x, y, size, color, speed, shape) {
    this.x = x;
    this.y = y;
    this.size = size; // tamaño base para las figuras
    this.color = color;
    this.speed = speed; // velocidad de caída
    this.shape = shape; // tipo de figura: 'square', 'triangle', 'diamond', 'star', 'hexagon'
  }

  // Método: dibuja el objeto según su forma
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    
    switch(this.shape) {
      case 'square':
        // Cuadrado
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        break;
      
      case 'triangle':
        // Triángulo
        ctx.moveTo(this.x, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'diamond':
        // Rombo
        ctx.moveTo(this.x, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y);
        ctx.lineTo(this.x, this.y + this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y);
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'star':
        // Estrella simple
        const spikes = 5;
        const outerRadius = this.size/2;
        const innerRadius = this.size/4;
        
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes;
          const xPos = this.x + Math.cos(angle) * radius;
          const yPos = this.y + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(xPos, yPos);
          } else {
            ctx.lineTo(xPos, yPos);
          }
        }
        ctx.closePath();
        ctx.fill();
        break;
      
      case 'hexagon':
        // Hexágono
        const sides = 6;
        ctx.moveTo(this.x + this.size/2 * Math.cos(0), this.y + this.size/2 * Math.sin(0));
        
        for (let i = 1; i <= sides; i++) {
          ctx.lineTo(
            this.x + this.size/2 * Math.cos(i * 2 * Math.PI / sides),
            this.y + this.size/2 * Math.sin(i * 2 * Math.PI / sides)
          );
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
  }

  // Método: actualiza posición (movimiento)
  update() {
    this.y += this.speed; // cae hacia abajo
    if (this.y - this.size > canvas.height) {
      // Si sale del canvas, reaparece arriba con nueva posición
      this.reset();
    }
    this.draw();
  }

  // Método: verifica si fue clicado
  isClicked(mouseX, mouseY) {
    // Para simplificar, usamos detección rectangular en lugar de por forma exacta
    const halfSize = this.size / 2;
    return mouseX >= this.x - halfSize && 
           mouseX <= this.x + halfSize && 
           mouseY >= this.y - halfSize && 
           mouseY <= this.y + halfSize;
  }

  // Método: reposiciona el objeto arriba del canvas
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -this.size;
    this.speed = 2 + Math.random() * 3;
    this.color = getRandomColor();
    this.shape = getRandomShape();
  }
}

// --- FUNCIÓN: genera color aleatorio ---
function getRandomColor() {
  const colors = ["#FF4B4B", "#4BFF7A", "#4BB8FF", "#F7FF4B", "#FF7AF7", "#FF964B", "#C04BFF"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// --- FUNCIÓN: genera forma aleatoria ---
function getRandomShape() {
  const shapes = ['square', 'triangle', 'diamond', 'star', 'hexagon'];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

// --- FUNCIÓN: genera los objetos iniciales ---
function generateObjects() {
  for (let i = 0; i < numObjects; i++) {
    const size = 30 + Math.random() * 30;
    const x = Math.random() * (canvas.width - size) + size/2;
    const y = Math.random() * canvas.height;
    const color = getRandomColor();
    const speed = 2 + Math.random() * 3;
    const shape = getRandomShape();
    objects.push(new FallingObject(x, y, size, color, speed, shape));
  }
}

// --- FUNCIÓN: animación principal ---
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Actualizar y dibujar cada objeto
  for (let obj of objects) {
    obj.update();
  }

  requestAnimationFrame(animate);
}

// --- EVENTO: clic en canvas ---
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Revisar si algún objeto fue clicado
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].isClicked(mouseX, mouseY)) {
      objects[i].reset(); // reposiciona arriba
      score++; // incrementa el contador
      scoreDisplay.textContent = `Eliminados: ${score}`; // actualiza el texto
      break; // solo contar un objeto por clic
    }
  }
});

// --- EVENTO: redimensionar ventana ---
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// --- INICIO DEL JUEGO ---
generateObjects();
animate();