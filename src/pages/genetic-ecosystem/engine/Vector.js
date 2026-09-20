/**
 * Simple 2D Vector class for steering behaviors and physics.
 * Supports both instance chainable methods and static operations.
 */
export class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // --- Static Creators & Operators ---

  static fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static random2D() {
    return Vector.fromAngle(Math.random() * Math.PI * 2);
  }

  static dist(v1, v2) {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }

  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static sub(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static mult(v, n) {
    return new Vector(v.x * n, v.y * n);
  }

  static div(v, n) {
    if (n === 0) return new Vector(0, 0);
    return new Vector(v.x / n, v.y / n);
  }

  // --- Instance Methods (Chainable) ---

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n) {
    if (n !== 0) {
      this.x /= n;
      this.y /= n;
    }
    return this;
  }

  magSq() {
    return this.x * this.x + this.y * this.y;
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  normalize() {
    const len = this.mag();
    if (len !== 0) {
      this.div(len);
    }
    return this;
  }

  limit(max) {
    const mSq = this.magSq();
    if (mSq > max * max) {
      this.normalize().mult(max);
    }
    return this;
  }

  setMag(len) {
    return this.normalize().mult(len);
  }

  heading() {
    return Math.atan2(this.y, this.x);
  }
}
