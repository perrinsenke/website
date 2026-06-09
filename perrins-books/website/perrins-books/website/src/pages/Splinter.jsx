import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store.js';
import './splinter/splinter.css';
import { 
  AutomataEngine, 
  TYPE_EMPTY, TYPE_LIFE, TYPE_CRYSTAL, TYPE_ACID, TYPE_WIRE, TYPE_WALL, TYPE_TAIL, TYPE_SAND, TYPE_WATER, TYPE_LAVA, TYPE_GAS
} from './splinter/engine.js';

export default function Splinter() {
  const set3DEnabled = useStore((state) => state.set3DEnabled);
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Disable 3D background
    set3DEnabled(false);

    // 2. Initialize Game Logic
    if (!containerRef.current) return;

    const wrapper = containerRef.current;
    const canvas = wrapper.querySelector('#gameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const btnPlay = wrapper.querySelector('#btn-play');
    const btnPause = wrapper.querySelector('#btn-pause');
    const btnStep = wrapper.querySelector('#btn-step');
    const btnClear = wrapper.querySelector('#btn-clear');
    const btnHelp = wrapper.querySelector('#btn-help');

    const pauseOverlay = wrapper.querySelector('#pause-overlay');
    const helpOverlay = wrapper.querySelector('#help-overlay');
    const btnResume = wrapper.querySelector('#btn-resume');
    const btnShowHelp = wrapper.querySelector('#btn-show-help');
    const btnCloseHelp = wrapper.querySelector('#btn-close-help');

    const btnSave = wrapper.querySelector('#btn-save');
    const btnLoad = wrapper.querySelector('#btn-load');
    const loadInput = wrapper.querySelector('#load-input');

    const inputWidth = wrapper.querySelector('#input-width');
    const inputHeight = wrapper.querySelector('#input-height');
    const btnResize = wrapper.querySelector('#btn-resize');

    const inputSpeed = wrapper.querySelector('#input-speed');
    const speedDisplay = wrapper.querySelector('#speed-display');
    const gallerySelect = wrapper.querySelector('#gallery-select');

    const toolBtns = wrapper.querySelectorAll('.tool-btn');

    // Configuration
    let GRID_WIDTH = parseInt(inputWidth.value);
    let GRID_HEIGHT = parseInt(inputHeight.value);
    let TICK_RATE_MS = parseInt(inputSpeed.value);

    let engine = new AutomataEngine(GRID_WIDTH, GRID_HEIGHT);

    function setupCanvas() {
      canvas.width = GRID_WIDTH;
      canvas.height = GRID_HEIGHT;
    }
    setupCanvas();

    let isRunning = false;
    let lastTickTime = 0;
    let animationId = null;
    let currentTool = 'life';

    // Tools
    toolBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        toolBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--color-black)'; // Reset border
        });
        e.target.classList.add('active');
        e.target.style.borderColor = e.target.style.color; // Highlight with its color
        currentTool = e.target.getAttribute('data-tool');
      });
    });

    // Colors for Cell Types
    const COLORS = {
      [TYPE_EMPTY]: '#ffffff',
      [TYPE_LIFE]: '#00ffff',     // Cyan
      [TYPE_CRYSTAL]: '#ffff00',  // Yellow
      [TYPE_ACID]: '#ff00ff',     // Magenta
      [TYPE_WIRE]: '#ffffff',     // White
      [TYPE_TAIL]: '#888888',     // Grey (dimmed wire)
      [TYPE_WALL]: '#444444',     // Dark Grey
      [TYPE_SAND]: '#ffaa00',     // Orange/Tan
      [TYPE_WATER]: '#4488ff',    // Light Blue
      [TYPE_LAVA]: '#ff3300',     // Red/Orange
      [TYPE_GAS]: '#cccccc'       // Light Grey
    };

    // Drawing
    function drawGrid() {
      ctx.fillStyle = '#000000'; // Black background for colors to pop
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          const type = engine.getCell(x, y);
          if (type !== TYPE_EMPTY) {
            ctx.fillStyle = COLORS[type];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    // Game Loop
    function gameLoop(timestamp) {
      if (isRunning) {
        if (timestamp - lastTickTime >= TICK_RATE_MS) {
          engine.step();
          lastTickTime = timestamp;
          drawGrid();
        }
        animationId = requestAnimationFrame(gameLoop);
      }
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      btnPlay.disabled = true;
      btnPause.disabled = false;
      btnStep.disabled = true;
      lastTickTime = performance.now();
      animationId = requestAnimationFrame(gameLoop);
    }

    function stop() {
      if (!isRunning) return;
      isRunning = false;
      btnPlay.disabled = false;
      btnPause.disabled = true;
      btnStep.disabled = false;
      if (animationId) cancelAnimationFrame(animationId);
    }

    // Controls
    inputSpeed.addEventListener('input', (e) => {
      TICK_RATE_MS = parseInt(e.target.value);
      speedDisplay.innerText = `${TICK_RATE_MS} ms`;
    });

    gallerySelect.addEventListener('change', (e) => {
      const choice = e.target.value;
      if (!choice) return;
      
      stop();
      engine.clear();
      
      if (choice === 'glider_gun') {
        const cells = [
          [24,0], [22,1], [24,1], [12,2], [13,2], [20,2], [21,2], [34,2], [35,2],
          [11,3], [15,3], [20,3], [21,3], [34,3], [35,3], [0,4], [1,4], [10,4], 
          [16,4], [20,4], [21,4], [0,5], [1,5], [10,5], [14,5], [16,5], [17,5], 
          [22,5], [24,5], [10,6], [16,6], [24,6], [11,7], [15,7], [12,8], [13,8]
        ];
        const ox = 10; const oy = 10;
        cells.forEach(c => engine.setCell(c[0] + ox, c[1] + oy, TYPE_LIFE));
      } 
      else if (choice === 'acorn') {
        const cx = Math.floor(GRID_WIDTH / 2) - 3;
        const cy = Math.floor(GRID_HEIGHT / 2);
        const cells = [[0,2], [1,2], [1,0], [3,1], [4,2], [5,2], [6,2]];
        cells.forEach(c => engine.setCell(cx + c[0], cy + c[1], TYPE_LIFE));
      }
      else if (choice === 'diehard') {
        const cx = Math.floor(GRID_WIDTH / 2) - 4;
        const cy = Math.floor(GRID_HEIGHT / 2);
        const cells = [[0,1], [1,1], [1,2], [5,2], [6,2], [7,2], [6,0]];
        cells.forEach(c => engine.setCell(cx + c[0], cy + c[1], TYPE_LIFE));
      }
      else if (choice === 'pulsar') {
        const cx = Math.floor(GRID_WIDTH / 2);
        const cy = Math.floor(GRID_HEIGHT / 2);
        const xs = [-6, -5, -4, 4, 5, 6];
        const ys = [-2, 2, -7, 7];
        xs.forEach(x => ys.forEach(y => engine.setCell(cx + x, cy + y, TYPE_LIFE)));
        const xs2 = [-2, 2, -7, 7];
        const ys2 = [-6, -5, -4, 4, 5, 6];
        xs2.forEach(x => ys2.forEach(y => engine.setCell(cx + x, cy + y, TYPE_LIFE)));
      }
      else if (choice === 'volcano') {
        const cx = Math.floor(GRID_WIDTH / 2);
        for (let y = GRID_HEIGHT - 30; y < GRID_HEIGHT; y++) {
          const width = (y - (GRID_HEIGHT - 30)) + 5;
          for (let x = cx - width; x <= cx + width; x++) {
            engine.setCell(x, y, TYPE_WALL);
          }
        }
        for (let y = GRID_HEIGHT - 30; y < GRID_HEIGHT; y++) {
          for (let x = cx - 3; x <= cx + 3; x++) {
            engine.setCell(x, y, TYPE_EMPTY);
          }
        }
        for (let y = GRID_HEIGHT - 10; y < GRID_HEIGHT; y++) {
          for (let x = cx - 3; x <= cx + 3; x++) {
            engine.setCell(x, y, TYPE_LAVA);
          }
        }
      }
      else if (choice === 'lava_lamp') {
        const cx = Math.floor(GRID_WIDTH / 2);
        const cy = Math.floor(GRID_HEIGHT / 2);
        for (let y = cy - 20; y <= cy + 20; y++) {
          engine.setCell(cx - 15, y, TYPE_WALL);
          engine.setCell(cx + 15, y, TYPE_WALL);
        }
        for (let x = cx - 15; x <= cx + 15; x++) {
          engine.setCell(x, cy - 20, TYPE_WALL);
          engine.setCell(x, cy + 20, TYPE_WALL);
        }
        for (let y = cy - 19; y <= cy + 19; y++) {
          for (let x = cx - 14; x <= cx + 14; x++) {
            engine.setCell(x, y, TYPE_WATER);
          }
        }
        for (let y = cy - 10; y <= cy + 10; y++) {
          for (let x = cx - 5; x <= cx + 5; x++) {
            if (Math.random() < 0.2) engine.setCell(x, y, TYPE_LAVA);
          }
        }
      }
      else if (choice === 'pentadecathlon') {
        const cx = Math.floor(GRID_WIDTH / 2);
        const cy = Math.floor(GRID_HEIGHT / 2);
        const cells = [[0,-4],[0,-3],[-1,-2],[1,-2],[0,-1],[0,0],[0,1],[0,2],[-1,3],[1,3],[0,4],[0,5]];
        cells.forEach(c => engine.setCell(cx + c[0], cy + c[1], TYPE_LIFE));
      }
      else if (choice === 'crystal_cave') {
        for (let x = 5; x < GRID_WIDTH - 5; x++) {
          engine.setCell(x, GRID_HEIGHT - 5, TYPE_WALL);
          if (x === 5 || x === GRID_WIDTH - 6) {
            for (let y = 10; y < GRID_HEIGHT - 5; y++) engine.setCell(x, y, TYPE_WALL);
          }
        }
        for (let y = GRID_HEIGHT - 25; y < GRID_HEIGHT - 6; y++) {
          for (let x = 6; x < GRID_WIDTH - 6; x++) {
            if (Math.random() < 0.7) engine.setCell(x, y, TYPE_WATER);
          }
        }
        engine.setCell(Math.floor(GRID_WIDTH / 2), GRID_HEIGHT - 6, TYPE_CRYSTAL);
      }
      else if (choice === 'the_core') {
        const cx = Math.floor(GRID_WIDTH / 2);
        const cy = Math.floor(GRID_HEIGHT / 2);
        for (let y = 0; y < GRID_HEIGHT; y++) {
          for (let x = 0; x < GRID_WIDTH; x++) {
            const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
            if (dist < 5) {
              if (Math.random() < 0.2) engine.setCell(x, y, TYPE_ACID);
              else if (Math.random() < 0.3) engine.setCell(x, y, TYPE_GAS);
            } else if (dist >= 5 && dist < 10) {
              if (Math.random() < 0.3) engine.setCell(x, y, TYPE_LAVA);
              else if (Math.random() < 0.2) engine.setCell(x, y, TYPE_SAND);
            } else if (dist >= 10 && dist < 12) {
              if (Math.random() < 0.8) engine.setCell(x, y, TYPE_WALL);
              else engine.setCell(x, y, TYPE_CRYSTAL);
            } else if (dist >= 12 && dist < 18) {
              if (Math.random() < 0.6) engine.setCell(x, y, TYPE_WATER);
              else if (Math.random() < 0.1) engine.setCell(x, y, TYPE_LIFE);
            } else if (dist >= 18 && dist < 24) {
              if (Math.random() < 0.05) engine.setCell(x, y, TYPE_WIRE);
            }
          }
        }
      }
      
      drawGrid();
      gallerySelect.value = ""; // reset
    });

    btnPlay.addEventListener('click', start);
    btnPause.addEventListener('click', stop);
    
    // Keydown listener needs to be properly removed on cleanup
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

    btnStep.addEventListener('click', () => {
      engine.step();
      drawGrid();
    });
    btnClear.addEventListener('click', () => {
      stop();
      engine.clear();
      drawGrid();
    });

    btnResume.addEventListener('click', () => {
      pauseOverlay.classList.add('hidden');
    });

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

    // Resize Grid
    btnResize.addEventListener('click', () => {
      const w = parseInt(inputWidth.value);
      const h = parseInt(inputHeight.value);
      if (w > 0 && h > 0) {
        GRID_WIDTH = w;
        GRID_HEIGHT = h;
        engine.resize(w, h);
        setupCanvas();
        drawGrid();
      }
    });

    // Save/Load
    btnSave.addEventListener('click', async () => {
      const code = engine.serialize();
      try {
        await navigator.clipboard.writeText(code);
        const originalText = btnSave.innerText;
        btnSave.innerText = "Copied!";
        setTimeout(() => btnSave.innerText = originalText, 2000);
      } catch (err) {
        alert("Save code: " + code);
      }
    });

    btnLoad.addEventListener('click', () => {
      const code = loadInput.value.trim();
      if (!code) return;
      const success = engine.deserialize(code);
      if (success) {
        GRID_WIDTH = engine.width;
        GRID_HEIGHT = engine.height;
        inputWidth.value = GRID_WIDTH;
        inputHeight.value = GRID_HEIGHT;
        setupCanvas();
        drawGrid();
        loadInput.value = '';
        const originalText = btnLoad.innerText;
        btnLoad.innerText = "Loaded!";
        setTimeout(() => btnLoad.innerText = originalText, 2000);
      } else {
        alert("Invalid save code.");
      }
    });

    // Interactive Drawing
    let isDrawing = false;

    function getMousePos(evt) {
      const rect = canvas.getBoundingClientRect();
      
      const cw = rect.width;
      const ch = rect.height;
      const iw = canvas.width;
      const ih = canvas.height;
      
      const ar_c = cw / ch;
      const ar_i = iw / ih;
      
      let renderedWidth = cw;
      let renderedHeight = ch;
      let offsetX = 0;
      let offsetY = 0;
      
      if (ar_c > ar_i) {
        // Container is wider than the image (pillarboxes left and right)
        renderedHeight = ch;
        renderedWidth = ch * ar_i;
        offsetX = (cw - renderedWidth) / 2;
      } else {
        // Container is taller than the image (letterboxes top and bottom)
        renderedWidth = cw;
        renderedHeight = cw / ar_i;
        offsetY = (ch - renderedHeight) / 2;
      }
      
      const mouseX = evt.clientX - rect.left - offsetX;
      const mouseY = evt.clientY - rect.top - offsetY;
      
      const scaleX = iw / renderedWidth;
      const scaleY = ih / renderedHeight;
      
      return {
        x: Math.floor(mouseX * scaleX),
        y: Math.floor(mouseY * scaleY)
      };
    }

    function applyTool(x, y) {
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
      
      let size = 1;
      if (currentTool === 'sand' || currentTool === 'water' || currentTool === 'lava' || currentTool === 'gas' || currentTool === 'erase') size = 2;
      
      for(let dy = 0; dy < size; dy++) {
        for(let dx = 0; dx < size; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;
          
          if (currentTool === 'life') engine.setCell(nx, ny, TYPE_LIFE);
          else if (currentTool === 'crystal') engine.setCell(nx, ny, TYPE_CRYSTAL);
          else if (currentTool === 'acid') engine.setCell(nx, ny, TYPE_ACID);
          else if (currentTool === 'wire') engine.setCell(nx, ny, TYPE_WIRE);
          else if (currentTool === 'sand') engine.setCell(nx, ny, TYPE_SAND);
          else if (currentTool === 'water') engine.setCell(nx, ny, TYPE_WATER);
          else if (currentTool === 'lava') engine.setCell(nx, ny, TYPE_LAVA);
          else if (currentTool === 'gas') engine.setCell(nx, ny, TYPE_GAS);
          else if (currentTool === 'wall') engine.setCell(nx, ny, TYPE_WALL);
          else if (currentTool === 'erase') engine.setCell(nx, ny, TYPE_EMPTY);
        }
      }
    }

    const onMouseDown = (e) => {
      isDrawing = true;
      const pos = getMousePos(e);
      applyTool(pos.x, pos.y);
      drawGrid();
    };

    const onMouseMove = (e) => {
      if (!isDrawing) return;
      const pos = getMousePos(e);
      applyTool(pos.x, pos.y);
      drawGrid();
    };

    const onMouseUp = () => {
      isDrawing = false;
    };

    const onMouseLeave = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // Initial draw
    drawGrid();

    // 3. Cleanup on unmount
    return () => {
      stop();
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.removeEventListener('keydown', handleKeydown);
      set3DEnabled(true);
    };
  }, [set3DEnabled]);

  return (
    <div className="splinter-page-wrapper" ref={containerRef}>
      <Link to="/projects" className="splinter-exit-btn">← BACK</Link>
      
      <div className="splinter-app">
        <div id="splinter-window-container">
          {/* Title Bar */}
          <div id="title-bar">
            <div className="title-stripes"></div>
            <div className="title-text">SPLINTER: The Automata Engine</div>
            <div className="title-stripes"></div>
          </div>

          {/* Toolbar */}
          <div id="toolbar">
            <button id="btn-play">▶ Play</button>
            <button id="btn-pause" disabled>⏸ Pause</button>
            <button id="btn-step">Step</button>
            <button id="btn-clear">Clear</button>
            <div className="divider"></div>
            <button id="btn-help">? Help</button>
          </div>

          {/* Main Workspace */}
          <div id="workspace">
            {/* Toolbox */}
            <div id="toolbox">
              <div className="toolbox-title">Gallery</div>
              <select id="gallery-select" style={{ width: '100%', marginBottom: '10px' }}>
                <option value="">-- Load Starter --</option>
                <option value="glider_gun">Gosper Glider Gun</option>
                <option value="acorn">The Acorn</option>
                <option value="diehard">Diehard</option>
                <option value="pulsar">Pulsar</option>
                <option value="pentadecathlon">Pentadecathlon</option>
                <option value="volcano">The Volcano</option>
                <option value="lava_lamp">Lava Lamp</option>
                <option value="crystal_cave">Crystal Cave</option>
                <option value="the_core">The Core</option>
              </select>
              
              <div className="toolbox-title">Species</div>
              <button className="tool-btn active" data-tool="life" style={{ color: 'cyan', background: 'black' }}>Life</button>
              <button className="tool-btn" data-tool="crystal" style={{ color: 'yellow', background: 'black' }}>Crystal</button>
              <button className="tool-btn" data-tool="acid" style={{ color: 'magenta', background: 'black' }}>Acid</button>
              <button className="tool-btn" data-tool="wire" style={{ color: 'white', background: 'black' }}>Wire</button>
              <button className="tool-btn" data-tool="sand" style={{ color: 'orange', background: 'black' }}>Sand</button>
              <button className="tool-btn" data-tool="water" style={{ color: '#4488ff', background: 'black' }}>Water</button>
              <button className="tool-btn" data-tool="lava" style={{ color: '#ff3300', background: 'black' }}>Lava</button>
              <button className="tool-btn" data-tool="gas" style={{ color: '#cccccc', background: 'black' }}>Gas</button>
              <button className="tool-btn" data-tool="wall" style={{ color: 'grey', background: 'black' }}>Wall</button>
              <button className="tool-btn" data-tool="erase">Eraser (X)</button>
              <div className="divider-horizontal"></div>
              
              <div className="toolbox-title">Simulation Speed</div>
              <input type="range" id="input-speed" min="10" max="1000" defaultValue="100" style={{ width: '100%', marginBottom: '5px' }} />
              <div id="speed-display" style={{ textAlign: 'center', fontSize: '0.8em', marginBottom: '10px' }}>100 ms</div>
              <div className="divider-horizontal"></div>
              
              <div className="toolbox-title">Grid Size</div>
              <input type="number" id="input-width" defaultValue="80" min="10" max="300" style={{ width: '100%', marginBottom: '5px' }} />
              <input type="number" id="input-height" defaultValue="50" min="10" max="300" style={{ width: '100%', marginBottom: '5px' }} />
              <button id="btn-resize">Apply Size</button>
            </div>
            {/* Canvas for Automata Grid */}
            <canvas id="gameCanvas"></canvas>
          </div>
        </div>

        {/* Overlays */}
        <div id="pause-overlay" className="overlay hidden">
          <div className="dialog">
            <h2>Game Paused</h2>
            <div className="pause-actions">
              <button id="btn-resume">Resume</button>
              <button id="btn-show-help">Help</button>
            </div>
            <div className="divider-horizontal"></div>
            <div className="save-load-section">
              <button id="btn-save">Copy Save Code</button>
              <div className="load-row">
                <input type="text" id="load-input" placeholder="Paste code here..." />
                <button id="btn-load">Load</button>
              </div>
            </div>
          </div>
        </div>

        <div id="help-overlay" className="overlay hidden">
          <div className="dialog help-dialog">
            <div className="dialog-title-bar">
              <span>Help Topics</span>
              <button id="btn-close-help">X</button>
            </div>
            <div className="dialog-content">
              <h3>Welcome to SPLINTER</h3>
              <p><strong>The Canvas:</strong> This is a generative art sandbox. Different "species" of cells interact based on their own mathematical rules.</p>
              <p><strong>Species:</strong></p>
              <ul>
                <li><strong>Life (Cyan):</strong> Pulses and moves chaotically.</li>
                <li><strong>Crystal (Yellow):</strong> Aggregates and grows beautiful fractal patterns slowly.</li>
                <li><strong>Acid (Magenta):</strong> Destroys Life, Crystal, Sand, and Water.</li>
                <li><strong>Wire (White):</strong> Travels like a spark of energy in straight lines.</li>
                <li><strong>Sand (Orange):</strong> Falls straight down. Tumbles down slopes.</li>
                <li><strong>Water (Blue):</strong> Falls down, and spreads horizontally to fill containers.</li>
                <li><strong>Lava (Red):</strong> Flows slowly. Burns Sand, Water, Life, and Crystal into Gas!</li>
                <li><strong>Gas (Light Grey):</strong> Anti-gravity! Floats up to the ceiling.</li>
                <li><strong>Wall (Grey):</strong> Indestructible barriers you can use to frame your art.</li>
                <li><strong>Eraser:</strong> Removes cells.</li>
              </ul>
              <p><strong>Controls:</strong> Press Play to run, change speed with the slider, or ESC to pause and save your artwork.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
