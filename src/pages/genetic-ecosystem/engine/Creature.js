import { Vector } from './Vector.js';
import { Brain } from './Brain.js';

export class Creature {
  constructor(x, y, type = 'herbivore') {
    this.position = new Vector(x, y);
    this.velocity = Vector.random2D().mult(Math.random() * 2 + 1);
    this.acceleration = new Vector(0, 0);
    this.type = type; // 'herbivore', 'predator', or 'apex'
    
    // Core ecosystem attributes and bounds
    this.age = 0;
    this.generation = 1;

    // Visual perception ray configurations
    this.maxSightDist = 155;
    this.eyeAngles = [-Math.PI / 6, 0, Math.PI / 6]; // -30°, 0°, 30°

    if (this.type === 'herbivore') {
      // Herbivore Stats
      this.maxSpeed = 3.6;
      this.maxForce = 0.18;
      this.radius = 8;
      this.maxEnergy = 1000;
      this.energy = 650; // Increased starting energy buffer for exploratory learning
      
      // Teal/Cyan HSL
      this.colorHue = 180 + Math.random() * 30;
      this.baseColor = `hsla(${this.colorHue}, 90%, 55%, 0.95)`;
      this.glowColor = `hsla(${this.colorHue}, 90%, 55%, 0.3)`;

      // Brain: 9 Inputs (3 food sensors, 3 predator sensors, 2 velocity, 1 energy)
      this.brain = new Brain(9, 6, 2);

      // Distinct sensory buffers
      this.eyeActivationsFood = [0, 0, 0];
      this.eyeTargetsFood = [null, null, null];
      this.eyeActivationsPredator = [0, 0, 0];
      this.eyeTargetsPredator = [null, null, null];

    } else if (this.type === 'predator') {
      // Predator Stats
      this.maxSpeed = 4.2; 
      this.maxForce = 0.22; 
      this.radius = 12; 
      this.maxEnergy = 1400;
      this.energy = 950; // High starting buffer to hunt
      
      // Vibrant Hot-Coral / Red HSL
      this.colorHue = 345 + (Math.random() - 0.5) * 15;
      this.baseColor = `hsla(${this.colorHue}, 95%, 55%, 0.95)`;
      this.glowColor = `hsla(${this.colorHue}, 95%, 55%, 0.3)`;

      // Brain: 6 Inputs (3 prey sensors, 2 velocity, 1 energy)
      this.brain = new Brain(6, 5, 2);

      // Visual sensory buffers
      this.eyeActivationsPrey = [0, 0, 0];
      this.eyeTargetsPrey = [null, null, null];

    } else {
      // Apex Predator Stats
      this.maxSpeed = 4.4; 
      this.maxForce = 0.22;
      this.radius = 16; 
      this.maxEnergy = 1600;
      this.energy = 1100; // Increased to give Apex ample time to spot scarce prey
      
      // Royal Purple HSL
      this.colorHue = 275 + (Math.random() - 0.5) * 15;
      this.baseColor = `hsla(${this.colorHue}, 95%, 55%, 0.95)`;
      this.glowColor = `hsla(${this.colorHue}, 95%, 55%, 0.3)`;

      // Brain: 9 Inputs (3 predator targets, 3 herbivore targets, 2 velocity, 1 energy)
      this.brain = new Brain(9, 6, 2);

      // Visual sensory buffers
      this.eyeActivationsPredator = [0, 0, 0];
      this.eyeTargetsPredator = [null, null, null];
      this.eyeActivationsHerbivore = [0, 0, 0];
      this.eyeTargetsHerbivore = [null, null, null];
    }
  }

  /**
   * Generalized sensory radar raycast sweep.
   */
  scanSensors(targets, heading) {
    const activations = [0, 0, 0];
    const targetPositions = [null, null, null];

    for (let i = 0; i < this.eyeAngles.length; i++) {
      const eyeAngle = heading + this.eyeAngles[i];
      let closestDist = this.maxSightDist;
      let closestTarget = null;

      for (const target of targets) {
        if (target === this) continue; // Ignore self

        const toTarget = Vector.sub(target.position, this.position);
        const dist = toTarget.mag();
        
        if (dist < closestDist) {
          const toTargetAngle = toTarget.heading();
          let angleDiff = Math.abs(toTargetAngle - eyeAngle);
          
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          angleDiff = Math.abs(angleDiff);

          // 15 degrees vision cone (0.26 radians)
          if (angleDiff < 0.26) {
            closestDist = dist;
            closestTarget = target;
          }
        }
      }

      if (closestTarget) {
        activations[i] = 1 - (closestDist / this.maxSightDist);
        targetPositions[i] = closestTarget.position;
      }
    }

    return { activations, targetPositions };
  }

  /**
   * Evaluates biological threats and rewards to drive neural movement output.
   */
  think(foodItems, otherCreatures) {
    const heading = this.velocity.heading();

    if (this.type === 'herbivore') {
      // 1. Scan for Food Nodes
      const foodScan = this.scanSensors(foodItems, heading);
      this.eyeActivationsFood = foodScan.activations;
      this.eyeTargetsFood = foodScan.targetPositions;

      // 2. Scan for dangerous Predators & Apex Predators
      const predators = otherCreatures.filter(c => c.type === 'predator' || c.type === 'apex');
      const predatorScan = this.scanSensors(predators, heading);
      this.eyeActivationsPredator = predatorScan.activations;
      this.eyeTargetsPredator = predatorScan.targetPositions;

      // 3. Assemble Herbivore inputs (9 items)
      const inputs = [
        this.eyeActivationsFood[0],
        this.eyeActivationsFood[1],
        this.eyeActivationsFood[2],
        this.eyeActivationsPredator[0],
        this.eyeActivationsPredator[1],
        this.eyeActivationsPredator[2],
        this.velocity.x / this.maxSpeed,
        this.velocity.y / this.maxSpeed,
        this.energy / this.maxEnergy
      ];

      const outputs = this.brain.feedForward(inputs);

      // Drive forces
      const steerAngle = outputs[0] * Math.PI;
      const steer = Vector.fromAngle(heading + steerAngle).setMag(this.maxForce);
      const throttle = (outputs[1] + 1) / 2;
      const thrust = Vector.fromAngle(heading).setMag(throttle * this.maxForce);

      this.applyForce(steer);
      this.applyForce(thrust);

    } else if (this.type === 'predator') {
      // 1. Scan for Herbivores (prey)
      const prey = otherCreatures.filter(c => c.type === 'herbivore');
      const preyScan = this.scanSensors(prey, heading);
      this.eyeActivationsPrey = preyScan.activations;
      this.eyeTargetsPrey = preyScan.targetPositions;

      // 2. Assemble Predator inputs (6 items)
      const inputs = [
        this.eyeActivationsPrey[0],
        this.eyeActivationsPrey[1],
        this.eyeActivationsPrey[2],
        this.velocity.x / this.maxSpeed,
        this.velocity.y / this.maxSpeed,
        this.energy / this.maxEnergy
      ];

      const outputs = this.brain.feedForward(inputs);

      // Drive forces
      const steerAngle = outputs[0] * Math.PI;
      const steer = Vector.fromAngle(heading + steerAngle).setMag(this.maxForce);
      const throttle = (outputs[1] + 1) / 2;
      const thrust = Vector.fromAngle(heading).setMag(throttle * this.maxForce);

      this.applyForce(steer);
      this.applyForce(thrust);
      
    } else {
      // Apex Predator (9-input brain)
      // 1. Scan for Predators (heavy prey)
      const predators = otherCreatures.filter(c => c.type === 'predator');
      const predScan = this.scanSensors(predators, heading);
      this.eyeActivationsPredator = predScan.activations;
      this.eyeTargetsPredator = predScan.targetPositions;

      // 2. Scan for Herbivores (light prey)
      const herbivores = otherCreatures.filter(c => c.type === 'herbivore');
      const herbScan = this.scanSensors(herbivores, heading);
      this.eyeActivationsHerbivore = herbScan.activations;
      this.eyeTargetsHerbivore = herbScan.targetPositions;

      // 3. Assemble inputs (9 items)
      const inputs = [
        this.eyeActivationsPredator[0],
        this.eyeActivationsPredator[1],
        this.eyeActivationsPredator[2],
        this.eyeActivationsHerbivore[0],
        this.eyeActivationsHerbivore[1],
        this.eyeActivationsHerbivore[2],
        this.velocity.x / this.maxSpeed,
        this.velocity.y / this.maxSpeed,
        this.energy / this.maxEnergy
      ];

      const outputs = this.brain.feedForward(inputs);

      // Drive forces
      const steerAngle = outputs[0] * Math.PI;
      const steer = Vector.fromAngle(heading + steerAngle).setMag(this.maxForce);
      const throttle = (outputs[1] + 1) / 2;
      const thrust = Vector.fromAngle(heading).setMag(throttle * this.maxForce);

      this.applyForce(steer);
      this.applyForce(thrust);
    }
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update(width, height) {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    const speedFactor = this.velocity.magSq() / (this.maxSpeed * this.maxSpeed);
    
    // Balanced visual energy decay constants (forgiving enough for exploration and learning)
    if (this.type === 'herbivore') {
      this.energy -= 0.32 + speedFactor * 0.24; // Calibrated base burn and speed factor
    } else if (this.type === 'predator') {
      this.energy -= 0.48 + speedFactor * 0.36; // Calibrated for high-intensity hunting
    } else {
      this.energy -= 0.58 + speedFactor * 0.42; // Calibrated Apex rate
    }
    
    if (this.energy < 0) this.energy = 0;
    this.age += 1;

    this.wrap(width, height);
  }

  wrap(width, height) {
    const buffer = this.radius * 2;
    if (this.position.x < -buffer) this.position.x = width + buffer;
    if (this.position.x > width + buffer) this.position.x = -buffer;
    if (this.position.y < -buffer) this.position.y = height + buffer;
    if (this.position.y > height + buffer) this.position.y = -buffer;
  }

  /**
   * Visualizes active target sweeps and radar lines.
   */
  drawSensors(ctx) {
    ctx.save();
    const heading = this.velocity.heading();

    if (this.type === 'herbivore') {
      // 1. Draw Food sensors (Green)
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const targetPos = this.eyeTargetsFood[i];
        if (targetPos) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 + this.eyeActivationsFood[i] * 0.48})`;
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 3;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.moveTo(this.position.x, this.position.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      }

      // 2. Draw Predator sensors (Alarm Red/Orange)
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const targetPos = this.eyeTargetsPredator[i];
        if (targetPos) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.15 + this.eyeActivationsPredator[i] * 0.55})`;
          ctx.lineWidth = 1.6;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(this.position.x, this.position.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      }

    } else if (this.type === 'predator') {
      // Predator vision: hunts Herbivores (Hot-Coral Red)
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const targetPos = this.eyeTargetsPrey[i];
        if (targetPos) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.15 + this.eyeActivationsPrey[i] * 0.55})`;
          ctx.lineWidth = 1.4;
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(this.position.x, this.position.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      }
    } else {
      // Apex Predator vision (Milestone 5 Addition)
      // 1. Target Predators (Light Magenta-Red)
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const targetPos = this.eyeTargetsPredator[i];
        if (targetPos) {
          ctx.strokeStyle = `rgba(217, 70, 239, ${0.18 + this.eyeActivationsPredator[i] * 0.55})`;
          ctx.lineWidth = 1.6;
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#d946ef';
          ctx.beginPath();
          ctx.moveTo(this.position.x, this.position.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      }

      // 2. Target Herbivores (Deep Purple)
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const targetPos = this.eyeTargetsHerbivore[i];
        if (targetPos) {
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 + this.eyeActivationsHerbivore[i] * 0.48})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(this.position.x, this.position.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.stroke();
        }
      }
    }

    // Draw passive guidelines if totally idle
    let isIdle = false;
    if (this.type === 'herbivore') {
      isIdle = !this.eyeTargetsFood.some(t => t !== null) && !this.eyeTargetsPredator.some(t => t !== null);
    } else if (this.type === 'predator') {
      isIdle = !this.eyeTargetsPrey.some(t => t !== null);
    } else {
      isIdle = !this.eyeTargetsPredator.some(t => t !== null) && !this.eyeTargetsHerbivore.some(t => t !== null);
    }

    if (isIdle) {
      for (let i = 0; i < this.eyeAngles.length; i++) {
        const angle = heading + this.eyeAngles[i];
        const sensorEnd = Vector.fromAngle(angle).mult(this.maxSightDist).add(this.position);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(sensorEnd.x, sensorEnd.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  draw(ctx) {
    this.drawSensors(ctx);

    const angle = this.velocity.heading();
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

    ctx.shadowBlur = this.type === 'herbivore' ? 10 : (this.type === 'predator' ? 15 : 20);
    ctx.shadowColor = this.glowColor;

    const energyRatio = this.energy / this.maxEnergy;
    const opacity = 0.35 + energyRatio * 0.65;
    
    ctx.fillStyle = `hsla(${this.colorHue}, 95%, 55%, ${opacity})`;
    ctx.strokeStyle = `hsla(${this.colorHue}, 95%, 70%, ${opacity})`;
    ctx.lineWidth = this.type === 'herbivore' ? 2 : (this.type === 'predator' ? 2.5 : 3.0);

    // Draw unique ship meshes
    ctx.beginPath();
    if (this.type === 'herbivore') {
      ctx.moveTo(this.radius * 1.5, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.85);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.lineTo(-this.radius, this.radius * 0.85);
    } else if (this.type === 'predator') {
      ctx.moveTo(this.radius * 1.8, 0);
      ctx.lineTo(-this.radius * 0.5, -this.radius * 0.9);
      ctx.lineTo(-this.radius, -this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.6, 0);
      ctx.lineTo(-this.radius, this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.5, this.radius * 0.9);
    } else {
      // Apex Predator: Heavy dreadnought triple-hull mesh
      ctx.moveTo(this.radius * 2.0, 0); 
      ctx.lineTo(-this.radius * 0.6, -this.radius * 1.0); 
      ctx.lineTo(-this.radius * 1.1, -this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.5, 0); 
      ctx.lineTo(-this.radius * 1.1, this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.6, this.radius * 1.0); 
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw glowing internal engine core
    if (this.type === 'herbivore') {
      ctx.fillStyle = `hsla(180, 100%, 85%, ${opacity})`;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.1, 0, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'predator') {
      ctx.fillStyle = `hsla(345, 100%, 85%, ${opacity})`;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.2, 0, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `hsla(275, 100%, 85%, ${opacity})`;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.2, 0, this.radius * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
