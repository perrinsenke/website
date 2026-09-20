import { Creature } from './Creature.js';
import { Food } from './Food.js';
import { Vector } from './Vector.js';

export class Engine {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) {
      throw new Error(`Container with id "${canvasContainerId}" not found.`);
    }

    // Create canvas dynamically
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Simulation settings
    this.isPaused = false;
    this.simSpeed = 1; // Default speed scale factor (can be 0.1, 0.25, 0.5, 1, 2, 3, 4)
    this.simSpeedAccumulator = 0; // Mathematical accumulator for slow motion
    
    // Spawn population parameters (Optimized for 60fps performance)
    this.herbivoreCount = 18;
    this.predatorCount = 3;
    this.apexCount = 2;
    this.foodCount = 35;
    
    // Dynamic God Deck parameters
    this.mutationRate = 0.15;
    this.mutationAmount = 0.22;

    // Selected creature for real-time brain inspection
    this.selectedCreature = null;

    // Arrays for active entities
    this.creatures = [];
    this.foodItems = [];

    // Dashboard Statistics
    this.stats = {
      fps: 0,
      generations: 1,
      totalEaten: 0,
      currentCreatures: 0, 
      currentPredators: 0, 
      currentApex: 0,      
      currentFood: 0
    };

    // FPS measurement
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsInterval = 1000;
    this.fpsTimer = 0;

    // Window size handling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize Simulation
    this.resetSimulation();
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();
    
    // Fall back to window size if layout hasn't computed container sizing yet
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    // Scale canvas pixels for high-DPI (retina) screens
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(dpr, dpr);
  }

  resetSimulation() {
    this.creatures = [];
    this.foodItems = [];
    this.selectedCreature = null;
    this.stats.totalEaten = 0;
    this.stats.generations = 1;

    // 1. Spawn Herbivores
    for (let i = 0; i < this.herbivoreCount; i++) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      this.creatures.push(new Creature(x, y, 'herbivore'));
    }

    // 2. Spawn Predators
    for (let i = 0; i < this.predatorCount; i++) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      this.creatures.push(new Creature(x, y, 'predator'));
    }

    // 3. Spawn Apex Predators
    for (let i = 0; i < this.apexCount; i++) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      this.creatures.push(new Creature(x, y, 'apex'));
    }

    // 4. Spawn initial food items
    for (let i = 0; i < this.foodCount; i++) {
      this.foodItems.push(new Food(this.width, this.height));
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  step() {
    if (this.isPaused) {
      this.update();
      this.draw();
    }
  }

  start() {
    if (this.animationId) return;
    const loop = (timestamp) => {
      this.calculateFPS(timestamp);

      if (!this.isPaused) {
        this.simSpeedAccumulator += this.simSpeed;
        
        if (this.simSpeed >= 1) {
          // Warp Speed: run update loop multiple times per frame
          const steps = Math.floor(this.simSpeed);
          for (let i = 0; i < steps; i++) {
            this.update();
          }
          this.simSpeedAccumulator = 0; // Reset fractional accumulator
        } else {
          // Slow Motion: only update when fractional speed crosses threshold of 1
          if (this.simSpeedAccumulator >= 1) {
            this.update();
            this.simSpeedAccumulator -= 1;
          }
        }
      }
      this.draw();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  calculateFPS(timestamp) {
    const elapsed = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    this.fpsTimer += elapsed;
    this.frameCount++;

    if (this.fpsTimer >= this.fpsInterval) {
      this.stats.fps = Math.round((this.frameCount * 1000) / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
  }

  /**
   * Click selector to grab a specimen for neural visualization.
   */
  handleCanvasClick(x, y) {
    const clickPos = new Vector(x, y);
    let closestCreature = null;
    let closestDist = 28; // Click cushion

    for (const creature of this.creatures) {
      const d = Vector.dist(creature.position, clickPos);
      if (d < closestDist) {
        closestDist = d;
        closestCreature = creature;
      }
    }

    this.selectedCreature = closestCreature;
    return this.selectedCreature;
  }

  deselectCreature() {
    this.selectedCreature = null;
  }

  /**
   * God Deck Trigger: Spawns a massive storm of food.
   */
  triggerFoodStorm() {
    for (let i = 0; i < 35; i++) {
      this.foodItems.push(new Food(this.width, this.height));
    }
  }

  /**
   * God Deck Trigger: Spawns a deadly biome plague.
   */
  triggerPlague() {
    for (const creature of this.creatures) {
      creature.energy /= 2; // Siphons 50% energy
    }
  }

  update() {
    // 1. Update all creatures, filter survivors, and handle reproduction
    const survivors = [];
    let selectedAlive = false;
    
    // Performance Safeguard: Limit cloning reproduction if population crosses 100
    const canReproduce = this.creatures.length < 100;
    
    for (const creature of this.creatures) {
      // Feed coordinates into brain
      creature.think(this.foodItems, this.creatures);
      creature.update(this.width, this.height);

      // Extinction Check: Skip dead creatures
      if (creature.energy <= 0) {
        continue;
      }

      // Check reproduction thresholds
      if (creature.type === 'herbivore') {
        if (canReproduce && creature.energy >= 900) {
          creature.energy /= 2;

          const childBrain = creature.brain.clone();
          childBrain.mutate(this.mutationRate, this.mutationAmount); 

          const child = new Creature(
            creature.position.x + (Math.random() - 0.5) * 16,
            creature.position.y + (Math.random() - 0.5) * 16,
            'herbivore'
          );
          child.brain = childBrain;
          child.generation = creature.generation + 1;
          child.energy = creature.energy;
          child.velocity = Vector.random2D().mult(creature.velocity.mag());
          
          survivors.push(child);

          if (child.generation > this.stats.generations) {
            this.stats.generations = child.generation;
          }
        }
      } else if (creature.type === 'predator') {
        if (canReproduce && creature.energy >= 1150) {
          creature.energy /= 2;

          const childBrain = creature.brain.clone();
          childBrain.mutate(this.mutationRate + 0.02, this.mutationAmount + 0.02);

          const child = new Creature(
            creature.position.x + (Math.random() - 0.5) * 20,
            creature.position.y + (Math.random() - 0.5) * 20,
            'predator'
          );
          child.brain = childBrain;
          child.generation = creature.generation + 1;
          child.energy = creature.energy;
          child.velocity = Vector.random2D().mult(creature.velocity.mag());

          survivors.push(child);

          if (child.generation > this.stats.generations) {
            this.stats.generations = child.generation;
          }
        }
      } else {
        // Apex Predator reproduction (Splits at 1300 energy)
        if (canReproduce && creature.energy >= 1300) {
          creature.energy /= 2;

          const childBrain = creature.brain.clone();
          childBrain.mutate(this.mutationRate + 0.04, this.mutationAmount + 0.04);

          const child = new Creature(
            creature.position.x + (Math.random() - 0.5) * 24,
            creature.position.y + (Math.random() - 0.5) * 24,
            'apex'
          );
          child.brain = childBrain;
          child.generation = creature.generation + 1;
          child.energy = creature.energy;
          child.velocity = Vector.random2D().mult(creature.velocity.mag());

          survivors.push(child);

          if (child.generation > this.stats.generations) {
            this.stats.generations = child.generation;
          }
        }
      }

      // Track if the selected creature is still alive
      if (creature === this.selectedCreature) {
        selectedAlive = true;
      }

      survivors.push(creature);
    }

    this.creatures = survivors;

    // Reset selection if inspected creature dies
    if (!selectedAlive) {
      this.selectedCreature = null;
    }

    // 2. Count species
    const herbCount = this.creatures.filter(c => c.type === 'herbivore').length;
    const predCount = this.creatures.filter(c => c.type === 'predator').length;
    const apexCount = this.creatures.filter(c => c.type === 'apex').length;

    // USER-REQUEST: Spawn EXACTLY ONE immigrant when population collapses to zero
    // This allows populations to grow naturally only from success, rather than random block spawns!
    if (herbCount === 0) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      const immigrant = new Creature(x, y, 'herbivore');
      immigrant.generation = 1;
      this.creatures.push(immigrant);
    }

    if (predCount === 0) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      const immigrant = new Creature(x, y, 'predator');
      immigrant.generation = 1;
      this.creatures.push(immigrant);
    }

    if (apexCount === 0) {
      const x = Math.random() * (this.width - 100) + 50;
      const y = Math.random() * (this.height - 100) + 50;
      const immigrant = new Creature(x, y, 'apex');
      immigrant.generation = 1;
      this.creatures.push(immigrant);
    }

    // 3. Collision Check 1: Herbivores eating Food Nodes
    for (let i = this.foodItems.length - 1; i >= 0; i--) {
      const food = this.foodItems[i];
      for (const creature of this.creatures) {
        if (creature.type !== 'herbivore') continue;

        const d = Vector.dist(creature.position, food.position);
        if (d < creature.radius + food.radius) {
          creature.energy = Math.min(creature.maxEnergy, creature.energy + 250);
          this.foodItems[i] = new Food(this.width, this.height);
          this.stats.totalEaten++;
          break;
        }
      }
    }

    // 4. Collision Check 2: Predators hunting Herbivores (Prey)
    const herbivores = this.creatures.filter(c => c.type === 'herbivore');
    const predators = this.creatures.filter(c => c.type === 'predator');

    for (const predator of predators) {
      for (const herbivore of herbivores) {
        if (herbivore.energy <= 0) continue;

        const d = Vector.dist(predator.position, herbivore.position);
        if (d < predator.radius + herbivore.radius) {
          predator.energy = Math.min(predator.maxEnergy, predator.energy + 450);
          herbivore.energy = 0; // Kills instantly
          this.stats.totalEaten++;
          break;
        }
      }
    }

    // 5. Collision Check 3: Apex Predators hunting Predators AND Herbivores (Trophic Tier 3)
    const apexPredators = this.creatures.filter(c => c.type === 'apex');
    
    for (const apex of apexPredators) {
      for (const victim of this.creatures) {
        if (victim.type === 'apex' || victim.energy <= 0) continue;

        const d = Vector.dist(apex.position, victim.position);
        if (d < apex.radius + victim.radius) {
          const energyGain = victim.type === 'predator' ? 600 : 350;
          apex.energy = Math.min(apex.maxEnergy, apex.energy + energyGain);
          victim.energy = 0; // Kills instantly
          this.stats.totalEaten++;
          break;
        }
      }
    }

    // Update stats counts
    this.stats.currentCreatures = this.creatures.filter(c => c.type === 'herbivore').length;
    this.stats.currentPredators = this.creatures.filter(c => c.type === 'predator').length;
    this.stats.currentApex = this.creatures.filter(c => c.type === 'apex').length;
    this.stats.currentFood = this.foodItems.length;

    // Dispatch update event
    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.stats);
    }
  }

  onUpdate(callback) {
    this.onUpdateCallback = callback;
  }

  draw() {
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#0a0b0e');
    bgGrad.addColorStop(1, '#12131a');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw grid
    this.drawGrid();

    // Draw food items
    for (const food of this.foodItems) {
      food.draw(this.ctx);
    }

    // Draw all creatures
    for (const creature of this.creatures) {
      creature.draw(this.ctx);
    }

    // Draw visual targeting ring around inspected Specimen
    if (this.selectedCreature) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = 1.8;
      
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#ffffff';

      this.ctx.setLineDash([4, 4]);
      const pulseRadius = this.selectedCreature.radius + 6 + Math.sin(Date.now() * 0.01) * 2;
      this.ctx.beginPath();
      this.ctx.arc(this.selectedCreature.position.x, this.selectedCreature.position.y, Math.max(4, pulseRadius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;
    const gridSize = 80;

    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
}
