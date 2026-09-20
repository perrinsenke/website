import { Engine } from './Engine.js';

// Setup and instantiate core simulation Engine
const engine = new Engine('simulation-container');

// HUD stats selectors (8 Telemetry Cards)
const elCreatures = document.getElementById('stat-creatures');
const elPredators = document.getElementById('stat-predators');
const elApex = document.getElementById('stat-apex');
const elFood = document.getElementById('stat-food');
const elGeneration = document.getElementById('stat-generation');
const elEaten = document.getElementById('stat-eaten');
const elSpeed = document.getElementById('stat-speed');
const elFps = document.getElementById('stat-fps');

// Dashboard buttons
const btnPause = document.getElementById('btn-pause');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');

// God Deck selectors (Sliders & Buttons)
const sliderMutationRate = document.getElementById('slider-mutation-rate');
const labelMutationRate = document.getElementById('label-mutation-rate');
const sliderMutationAmount = document.getElementById('slider-mutation-amount');
const labelMutationAmount = document.getElementById('label-mutation-amount');
const sliderSimSpeed = document.getElementById('slider-sim-speed');
const labelSimSpeed = document.getElementById('label-sim-speed');
const btnFoodStorm = document.getElementById('btn-food-storm');
const btnPlague = document.getElementById('btn-plague');

// Creature Inspector selectors
const inspectorPanel = document.getElementById('inspector-panel');
const inspectorInactive = document.getElementById('inspector-inactive');
const inspectorActive = document.getElementById('inspector-active');
const inspectType = document.getElementById('inspect-type');
const inspectEnergy = document.getElementById('inspect-energy');
const inspectAge = document.getElementById('inspect-age');
const inspectGen = document.getElementById('inspect-gen');
const btnDeselect = document.getElementById('btn-deselect');

// Brain visualizer canvas
const brainCanvas = document.getElementById('brain-canvas');
const brainCtx = brainCanvas.getContext('2d');

// --- Event Bindings: UI Telemetry ---

engine.onUpdate((stats) => {
  elCreatures.textContent = stats.currentCreatures;
  elPredators.textContent = stats.currentPredators;
  elApex.textContent = stats.currentApex; // Added for Apex Predators count
  elFood.textContent = stats.currentFood;
  elEaten.textContent = stats.totalEaten;
  elGeneration.textContent = stats.generations;
  elSpeed.textContent = `${engine.simSpeed}x`; // Added Sim Speed count
  elFps.textContent = stats.fps;

  // Dynamically update inspector values if a specimen is selected
  if (engine.selectedCreature) {
    const sc = engine.selectedCreature;
    inspectType.textContent = sc.type;
    
    // Custom colors for class types
    if (sc.type === 'herbivore') {
      inspectType.style.color = 'var(--accent-cyan)';
    } else if (sc.type === 'predator') {
      inspectType.style.color = '#f43f5e';
    } else {
      inspectType.style.color = '#a855f7'; // Purple for Apex
    }
    
    inspectEnergy.textContent = `${Math.round(sc.energy)} / ${sc.maxEnergy}`;
    inspectAge.textContent = `${sc.age} ticks`;
    inspectGen.textContent = sc.generation;
    
    // Draw the neural network connections on the brain canvas
    drawBrain(brainCanvas, brainCtx, sc.brain);
  } else {
    // Hide active panel if selection was cleared
    inspectorActive.style.display = 'none';
    inspectorInactive.style.display = 'block';
  }
});

// --- Event Bindings: Play/Pause/Reset ---

btnPause.addEventListener('click', () => {
  engine.togglePause();
  if (engine.isPaused) {
    btnPause.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 4l14 8-14 8z"/></svg>
      Resume Biome
    `;
    btnPause.classList.remove('btn-primary');
    btnPause.style.background = 'rgba(16, 185, 129, 0.15)';
    btnPause.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    btnPause.style.color = 'var(--accent-mint)';
    btnStep.removeAttribute('disabled');
    btnStep.style.opacity = '1';
  } else {
    btnPause.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
      Pause Biome
    `;
    btnPause.classList.add('btn-primary');
    btnPause.style.background = '';
    btnPause.style.borderColor = '';
    btnPause.style.color = '';
    btnStep.setAttribute('disabled', 'true');
    btnStep.style.opacity = '0.5';
  }
});

btnStep.addEventListener('click', () => {
  engine.step();
});

btnReset.addEventListener('click', () => {
  engine.resetSimulation();
});

// --- Event Bindings: God Deck ---

sliderMutationRate.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  engine.mutationRate = val;
  labelMutationRate.textContent = `${Math.round(val * 100)}%`;
});

sliderMutationAmount.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  engine.mutationAmount = val;
  labelMutationAmount.textContent = val.toFixed(2);
});

const speedSteps = [0.1, 0.25, 0.5, 1, 2, 3, 4];
sliderSimSpeed.addEventListener('input', (e) => {
  const idx = parseInt(e.target.value);
  const val = speedSteps[idx];
  engine.simSpeed = val;
  labelSimSpeed.textContent = `${val}x`;
  elSpeed.textContent = `${val}x`;
});

btnFoodStorm.addEventListener('click', () => {
  engine.triggerFoodStorm();
});

btnPlague.addEventListener('click', () => {
  engine.triggerPlague();
});

// --- Event Bindings: Click Selection ---

engine.canvas.addEventListener('click', (e) => {
  const rect = engine.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const selected = engine.handleCanvasClick(x, y);

  if (selected) {
    inspectorInactive.style.display = 'none';
    inspectorActive.style.display = 'block';
  } else {
    inspectorActive.style.display = 'none';
    inspectorInactive.style.display = 'block';
  }
});

btnDeselect.addEventListener('click', () => {
  engine.deselectCreature();
  inspectorActive.style.display = 'none';
  inspectorInactive.style.display = 'block';
});

// --- Neural Network Visualizer Function ---

function drawBrain(canvas, ctx, brain) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const paddingX = 40;
  const paddingY = 20;

  const xInputs = paddingX;
  const xHidden = canvas.width / 2;
  const xOutputs = canvas.width - paddingX;

  const yInputs = Array.from(
    { length: brain.inputCount },
    (_, i) => paddingY + (i * (canvas.height - 2 * paddingY)) / (brain.inputCount - 1)
  );

  const yHidden = Array.from(
    { length: brain.hiddenCount },
    (_, i) => paddingY + 15 + (i * (canvas.height - 2 * paddingY - 30)) / (brain.hiddenCount - 1)
  );

  const yOutputs = Array.from(
    { length: brain.outputCount },
    (_, i) => paddingY + 45 + (i * (canvas.height - 2 * paddingY - 90)) / (brain.outputCount - 1)
  );

  // 1. Connection Input -> Hidden
  for (let h = 0; h < brain.hiddenCount; h++) {
    for (let i = 0; i < brain.inputCount; i++) {
      const weight = brain.weightsIH[h][i];
      const opacity = Math.min(1, Math.abs(weight)) * 0.65;
      
      ctx.lineWidth = Math.min(2.5, Math.abs(weight) * 1.5 + 0.5);
      ctx.strokeStyle = weight >= 0 
        ? `rgba(16, 185, 129, ${opacity})` 
        : `rgba(244, 63, 94, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(xInputs, yInputs[i]);
      ctx.lineTo(xHidden, yHidden[h]);
      ctx.stroke();
    }
  }

  // 2. Connection Hidden -> Output
  for (let o = 0; o < brain.outputCount; o++) {
    for (let h = 0; h < brain.hiddenCount; h++) {
      const weight = brain.weightsHO[o][h];
      const opacity = Math.min(1, Math.abs(weight)) * 0.65;
      
      ctx.lineWidth = Math.min(2.5, Math.abs(weight) * 1.5 + 0.5);
      ctx.strokeStyle = weight >= 0 
        ? `rgba(16, 185, 129, ${opacity})` 
        : `rgba(244, 63, 94, ${opacity})`;

      ctx.beginPath();
      ctx.moveTo(xHidden, yHidden[h]);
      ctx.lineTo(xOutputs, yOutputs[o]);
      ctx.stroke();
    }
  }

  // 3. Nodes Input
  for (let i = 0; i < brain.inputCount; i++) {
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(xInputs, yInputs[i], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Nodes Hidden
  for (let h = 0; h < brain.hiddenCount; h++) {
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(xHidden, yHidden[h], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Nodes Output
  for (let o = 0; o < brain.outputCount; o++) {
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(xOutputs, yOutputs[o], 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Initialize button attributes
btnStep.setAttribute('disabled', 'true');
btnStep.style.opacity = '0.5';

// Boot simulation
engine.start();
console.log('Neural Ecosystem Sim booted successfully.');
