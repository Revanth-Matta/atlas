const canvas = document.getElementById("starfield");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let stars = [];
let animationId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createStars();
}

function createStars() {
  const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 6500));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.18 + 0.03,
    hue: Math.random() > 0.82 ? "55, 224, 200" : "245, 239, 226"
  }));
}

function drawStars() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${star.hue}, ${star.opacity})`;
    context.fill();

    if (!reducedMotion) {
      star.y -= star.speed;
      if (star.y < -5) star.y = canvas.height + 5;
    }
  });

  animationId = requestAnimationFrame(drawStars);
}

resizeCanvas();
drawStars();

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationId);
  resizeCanvas();
  drawStars();
});
