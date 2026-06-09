/**
 * ASCII particle emitter for the bookshelf.
 * Spawns small text characters that radiate outward from a target element's center.
 */

const CHARS = ['·', '•', '~', '+', '°', '⁺', '*', ':', '∘', '⋅', '╌', '╍', '┄'];
const COLORS = [
  '#e4e4e7', // --text
  '#a1a1aa', // --text-muted
  '#71717a', // --text-dim
  '#d4c5a9', // --accent
  '#a89f8a', // --accent-dim
];

const SPAWN_INTERVAL = 60;
const MAX_PARTICLES = 60;

let particles = [];
let container = null;
let targetEl = null;
let animFrame = null;
let spawnTimer = null;

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function spawnParticle() {
  if (!targetEl || !container) return;
  if (particles.length >= MAX_PARTICLES) return;

  const rect = targetEl.getBoundingClientRect();
  const pad = 4; // spawn just outside the card edge

  const el = document.createElement('span');
  el.className = 'ascii-particle';
  el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
  el.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  el.style.fontSize = `${randomRange(9, 15)}px`;

  // Pick a random edge: 0=top, 1=right, 2=bottom, 3=left
  const side = Math.floor(Math.random() * 4);
  let x, y, vx, vy;
  const speed = randomRange(0.3, 0.9);
  const drift = randomRange(-0.3, 0.3);

  switch (side) {
    case 0: // top
      x = rect.left + Math.random() * rect.width;
      y = rect.top - pad;
      vx = drift;
      vy = -speed;
      break;
    case 1: // right
      x = rect.right + pad;
      y = rect.top + Math.random() * rect.height;
      vx = speed;
      vy = drift;
      break;
    case 2: // bottom
      x = rect.left + Math.random() * rect.width;
      y = rect.bottom + pad;
      vx = drift;
      vy = speed;
      break;
    case 3: // left
      x = rect.left - pad;
      y = rect.top + Math.random() * rect.height;
      vx = -speed;
      vy = drift;
      break;
  }

  const particle = {
    el,
    x,
    y,
    vx,
    vy,
    life: 1.0,
    decay: randomRange(0.006, 0.014),
    rotation: randomRange(0, 360),
    rotSpeed: randomRange(-1.5, 1.5),
  };

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.opacity = '0';

  container.appendChild(el);
  particles.push(particle);
}

function tick() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    p.rotation += p.rotSpeed;

    // Gentle drift variation
    p.vx += randomRange(-0.01, 0.01);
    p.vy += randomRange(-0.01, 0.01);

    if (p.life <= 0) {
      p.el.remove();
      particles.splice(i, 1);
      continue;
    }

    // Fade in quickly, then fade out
    const alpha = p.life > 0.85 ? (1 - p.life) / 0.15 : p.life;

    p.el.style.left = `${p.x}px`;
    p.el.style.top = `${p.y}px`;
    p.el.style.opacity = alpha;
    p.el.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg)`;
  }

  animFrame = requestAnimationFrame(tick);
}

/** Initialize the particle system targeting a specific element */
export function initParticles(el) {
  destroy();

  targetEl = el;

  // Full-viewport fixed container so coordinates are simple
  container = document.createElement('div');
  container.className = 'particle-container';
  document.body.appendChild(container);

  spawnTimer = setInterval(spawnParticle, SPAWN_INTERVAL);
  animFrame = requestAnimationFrame(tick);

  // Seed a burst of initial particles
  for (let i = 0; i < 12; i++) {
    setTimeout(spawnParticle, i * 20);
  }
}

/** Clean up everything */
export function destroy() {
  if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  particles.forEach(p => p.el.remove());
  particles = [];
  if (container) { container.remove(); container = null; }
  targetEl = null;
}
