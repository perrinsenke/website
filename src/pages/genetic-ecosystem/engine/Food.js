import { Vector } from './Vector.js';

export class Food {
  constructor(width, height) {
    this.position = new Vector(
      Math.random() * (width - 40) + 20,
      Math.random() * (height - 40) + 20
    );
    this.radius = 4;
    // Harmonious neon mint green for plants/food
    this.color = 'hsla(150, 80%, 50%, 0.95)';
    this.glowColor = 'hsla(150, 80%, 50%, 0.4)';
  }

  draw(ctx) {
    ctx.save();
    // Add dynamic organic pulsing effect
    const pulse = Math.sin(Date.now() * 0.005) * 1.5;
    const finalRadius = this.radius + pulse;

    // Glowing aura
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.glowColor;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, Math.max(2, finalRadius), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
