import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store.js';
import './genetic.css';
import { Engine } from './genetic-ecosystem/engine/Engine.js';

export default function GeneticEcosystem() {
  const set3DEnabled = useStore((state) => state.set3DEnabled);
  const containerRef = useRef(null);

  useEffect(() => {
    set3DEnabled(false);

    if (!containerRef.current) return;
    const wrapper = containerRef.current;

    // We can instantiate the engine since we have the div rendered with id 'simulation-container'
    let engine;
    try {
      engine = new Engine('simulation-container');
    } catch (e) {
      console.error(e);
      return;
    }

    // HUD stats selectors
    const elCreatures = wrapper.querySelector('#stat-creatures');
    const elPredators = wrapper.querySelector('#stat-predators');
    const elApex = wrapper.querySelector('#stat-apex');
    const elFood = wrapper.querySelector('#stat-food');
    const elGeneration = wrapper.querySelector('#stat-generation');
    const elEaten = wrapper.querySelector('#stat-eaten');
    const elSpeed = wrapper.querySelector('#stat-speed');
    const elFps = wrapper.querySelector('#stat-fps');

    // Dashboard buttons
    const btnPlay = wrapper.querySelector('#btn-play');
    const btnPause = wrapper.querySelector('#btn-pause');
    const btnStep = wrapper.querySelector('#btn-step');
    const btnReset = wrapper.querySelector('#btn-reset');
    const btnHelp = wrapper.querySelector('#btn-help');

    const pauseOverlay = wrapper.querySelector('#pause-overlay');
    const helpOverlay = wrapper.querySelector('#help-overlay');
    const btnResume = wrapper.querySelector('#btn-resume');
    const btnShowHelp = wrapper.querySelector('#btn-show-help');
    const btnCloseHelp = wrapper.querySelector('#btn-close-help');

    // God Deck selectors
    const sliderMutationRate = wrapper.querySelector('#slider-mutation-rate');
    const labelMutationRate = wrapper.querySelector('#label-mutation-rate');
    const sliderMutationAmount = wrapper.querySelector('#slider-mutation-amount');
    const labelMutationAmount = wrapper.querySelector('#label-mutation-amount');
    const sliderSimSpeed = wrapper.querySelector('#slider-sim-speed');
    const labelSimSpeed = wrapper.querySelector('#label-sim-speed');
    const btnFoodStorm = wrapper.querySelector('#btn-food-storm');
    const btnPlague = wrapper.querySelector('#btn-plague');

    // Creature Inspector selectors
    const inspectorInactive = wrapper.querySelector('#inspector-inactive');
    const inspectorActive = wrapper.querySelector('#inspector-active');
    const inspectType = wrapper.querySelector('#inspect-type');
    const inspectEnergy = wrapper.querySelector('#inspect-energy');
    const inspectAge = wrapper.querySelector('#inspect-age');
    const inspectGen = wrapper.querySelector('#inspect-gen');

    // Brain visualizer canvas
    const brainCanvas = wrapper.querySelector('#brain-canvas');
    const brainCtx = brainCanvas.getContext('2d');

    function drawBrain(canvas, ctx, brain) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const paddingX = 20;
      const paddingY = 20;
      const xInputs = paddingX;
      const xHidden = canvas.width / 2;
      const xOutputs = canvas.width - paddingX;

      const yInputs = Array.from({ length: brain.inputCount }, (_, i) => paddingY + (i * (canvas.height - 2 * paddingY)) / (brain.inputCount - 1));
      const yHidden = Array.from({ length: brain.hiddenCount }, (_, i) => paddingY + 15 + (i * (canvas.height - 2 * paddingY - 30)) / (brain.hiddenCount - 1));
      const yOutputs = Array.from({ length: brain.outputCount }, (_, i) => paddingY + 45 + (i * (canvas.height - 2 * paddingY - 90)) / (brain.outputCount - 1));

      for (let h = 0; h < brain.hiddenCount; h++) {
        for (let i = 0; i < brain.inputCount; i++) {
          const weight = brain.weightsIH[h][i];
          const opacity = Math.min(1, Math.abs(weight)) * 0.8;
          ctx.lineWidth = Math.min(2, Math.abs(weight) * 1.5 + 0.5);
          ctx.strokeStyle = weight >= 0 ? `rgba(0, 0, 0, ${opacity})` : `rgba(200, 0, 0, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(xInputs, yInputs[i]);
          ctx.lineTo(xHidden, yHidden[h]);
          ctx.stroke();
        }
      }

      for (let o = 0; o < brain.outputCount; o++) {
        for (let h = 0; h < brain.hiddenCount; h++) {
          const weight = brain.weightsHO[o][h];
          const opacity = Math.min(1, Math.abs(weight)) * 0.8;
          ctx.lineWidth = Math.min(2, Math.abs(weight) * 1.5 + 0.5);
          ctx.strokeStyle = weight >= 0 ? `rgba(0, 0, 0, ${opacity})` : `rgba(200, 0, 0, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(xHidden, yHidden[h]);
          ctx.lineTo(xOutputs, yOutputs[o]);
          ctx.stroke();
        }
      }

      const drawNode = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      for (let i = 0; i < brain.inputCount; i++) drawNode(xInputs, yInputs[i], '#fff');
      for (let h = 0; h < brain.hiddenCount; h++) drawNode(xHidden, yHidden[h], '#aaa');
      for (let o = 0; o < brain.outputCount; o++) drawNode(xOutputs, yOutputs[o], '#444');
    }

    engine.onUpdate((stats) => {
      if (elCreatures) elCreatures.textContent = stats.currentCreatures;
      if (elPredators) elPredators.textContent = stats.currentPredators;
      if (elApex) elApex.textContent = stats.currentApex;
      if (elFood) elFood.textContent = stats.currentFood;
      if (elEaten) elEaten.textContent = stats.totalEaten;
      if (elGeneration) elGeneration.textContent = stats.generations;
      if (elSpeed) elSpeed.textContent = `${engine.simSpeed}x`;
      if (elFps) elFps.textContent = stats.fps;

      if (engine.selectedCreature) {
        const sc = engine.selectedCreature;
        inspectType.textContent = sc.type.toUpperCase();
        inspectEnergy.textContent = `${Math.round(sc.energy)} / ${sc.maxEnergy}`;
        inspectAge.textContent = `${sc.age} ticks`;
        inspectGen.textContent = sc.generation;
        drawBrain(brainCanvas, brainCtx, sc.brain);
      } else {
        inspectorActive.style.display = 'none';
        inspectorInactive.style.display = 'block';
      }
    });

    const start = () => {
      engine.isPaused = false;
      btnPlay.disabled = true;
      btnPause.disabled = false;
      btnStep.disabled = true;
    };

    const stop = () => {
      engine.isPaused = true;
      btnPlay.disabled = false;
      btnPause.disabled = true;
      btnStep.disabled = false;
    };

    btnPlay.addEventListener('click', start);
    btnPause.addEventListener('click', stop);
    btnStep.addEventListener('click', () => { engine.step(); });
    btnReset.addEventListener('click', () => { engine.resetSimulation(); });

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
    });

    btnFoodStorm.addEventListener('click', () => { engine.triggerFoodStorm(); });
    btnPlague.addEventListener('click', () => { engine.triggerPlague(); });

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

    // (Removed deselect button event listener)

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        if (!pauseOverlay.classList.contains('hidden')) {
          pauseOverlay.classList.add('hidden');
        } else {
          stop();
          pauseOverlay.classList.remove('hidden');
        }
      }
    };
    document.addEventListener('keydown', handleKeydown);

    btnResume.addEventListener('click', () => { pauseOverlay.classList.add('hidden'); });
    btnHelp.addEventListener('click', () => {
      stop();
      helpOverlay.classList.remove('hidden');
    });
    btnShowHelp.addEventListener('click', () => {
      pauseOverlay.classList.add('hidden');
      helpOverlay.classList.remove('hidden');
    });
    btnCloseHelp.addEventListener('click', () => {
      helpOverlay.classList.add('hidden');
    });

    // Boot
    engine.start();

    return () => {
      engine.isPaused = true;
      engine.stop();
      document.removeEventListener('keydown', handleKeydown);
      set3DEnabled(true);
      // Clean up canvas
      if (engine.canvas && engine.canvas.parentNode) {
        engine.canvas.parentNode.removeChild(engine.canvas);
      }
    };
  }, [set3DEnabled]);

  return (
    <div className="genetic-page-wrapper" ref={containerRef}>
      <Link to="/projects" className="genetic-exit-btn">← BACK</Link>
      
      <div className="genetic-app">
        <div id="genetic-window-container">
          {/* Title Bar */}
          <div id="title-bar">
            <div className="title-stripes"></div>
            <div className="title-text">GENETIC ECOSYSTEM: Neural Sim</div>
            <div className="title-stripes"></div>
          </div>

          {/* Toolbar */}
          <div id="toolbar">
            <button id="btn-play" disabled>▶ Play</button>
            <button id="btn-pause">⏸ Pause</button>
            <button id="btn-step" disabled>Step</button>
            <button id="btn-reset">Reset Biome</button>
            <div className="divider"></div>
            <button id="btn-help">? Help</button>
          </div>

          {/* Main Workspace */}
          <div id="workspace">
            {/* Toolbox (Left Sidebar) */}
            <div id="toolbox">
              <div className="toolbox-title">Telemetry</div>
              <div className="stat-row"><span>Herbivores</span><span id="stat-creatures">--</span></div>
              <div className="stat-row"><span>Predators</span><span id="stat-predators">--</span></div>
              <div className="stat-row"><span>Apex Hunters</span><span id="stat-apex">--</span></div>
              <div className="stat-row"><span>Food Nodes</span><span id="stat-food">--</span></div>
              <div className="stat-row"><span>Generation</span><span id="stat-generation">--</span></div>
              <div className="stat-row"><span>Consumed</span><span id="stat-eaten">--</span></div>
              <div className="stat-row"><span>Sim Speed</span><span id="stat-speed">--</span></div>
              <div className="stat-row"><span>FPS</span><span id="stat-fps">--</span></div>

              <div className="divider-horizontal"></div>

              <div className="toolbox-title">God Deck</div>
              
              <div className="slider-group">
                <div className="slider-label"><span>Mut. Rate</span><span id="label-mutation-rate">15%</span></div>
                <input type="range" id="slider-mutation-rate" min="0" max="0.5" step="0.01" defaultValue="0.15" />
              </div>

              <div className="slider-group">
                <div className="slider-label"><span>Mut. Amt</span><span id="label-mutation-amount">0.22</span></div>
                <input type="range" id="slider-mutation-amount" min="0.05" max="0.5" step="0.01" defaultValue="0.22" />
              </div>

              <div className="slider-group">
                <div className="slider-label"><span>Speed</span><span id="label-sim-speed">1x</span></div>
                <input type="range" id="slider-sim-speed" min="0" max="6" step="1" defaultValue="3" />
              </div>

              <div className="btn-grid">
                <button id="btn-food-storm">Food Storm</button>
                <button id="btn-plague">Plague Call</button>
              </div>

              <div className="divider-horizontal"></div>

              <div className="toolbox-title">Specimen</div>
              <div id="inspector-inactive" style={{ fontSize: '0.8rem', textAlign: 'center', margin: '10px 0' }}>
                Click a creature to inspect brain.
              </div>
              
              <div id="inspector-active" style={{ display: 'none' }}>
                <div className="stat-row"><span>Type</span><span id="inspect-type">--</span></div>
                <div className="stat-row"><span>Energy</span><span id="inspect-energy">--</span></div>
                <div className="stat-row"><span>Age</span><span id="inspect-age">--</span></div>
                <div className="stat-row"><span>Gen</span><span id="inspect-gen">--</span></div>
                
                <canvas id="brain-canvas" width="160" height="120" style={{ background: '#fff', border: '2px solid #000', margin: '10px 0', width: '100%' }}></canvas>
              </div>

            </div>

            {/* Canvas Container */}
            <div id="simulation-container"></div>
          </div>
        </div>

        {/* Overlays */}
        <div id="pause-overlay" className="overlay hidden">
          <div className="dialog">
            <h2>Simulation Paused</h2>
            <button id="btn-resume">Resume</button>
            <button id="btn-show-help">Help</button>
          </div>
        </div>

        <div id="help-overlay" className="overlay hidden">
          <div className="dialog help-dialog">
            <div className="dialog-title-bar">
              <span>Help Topics</span>
              <button id="btn-close-help">X</button>
            </div>
            <div className="dialog-content">
              <h3>Genetic Ecosystem</h3>
              <p>A neural-network driven evolution simulator where creatures learn to survive.</p>
              <ul>
                <li><strong>Herbivores (Green):</strong> Eat food to reproduce.</li>
                <li><strong>Predators (Red):</strong> Hunt herbivores.</li>
                <li><strong>Apex Hunters (Purple):</strong> Hunt everything.</li>
              </ul>
              <p>Click any creature to view its live neural brain.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
