export const TYPE_EMPTY = 0;
export const TYPE_LIFE = 1;
export const TYPE_CRYSTAL = 2;
export const TYPE_ACID = 3;
export const TYPE_WIRE = 4;
export const TYPE_WALL = 5;
export const TYPE_TAIL = 6;
export const TYPE_SAND = 7;
export const TYPE_WATER = 8;
export const TYPE_LAVA = 9;
export const TYPE_GAS = 10;

export class AutomataEngine {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
  }

  resize(newWidth, newHeight) {
    const newGrid = new Uint8Array(newWidth * newHeight);
    const minW = Math.min(this.width, newWidth);
    const minH = Math.min(this.height, newHeight);
    
    for (let y = 0; y < minH; y++) {
      for (let x = 0; x < minW; x++) {
        newGrid[y * newWidth + x] = this.grid[y * this.width + x];
      }
    }
    
    this.width = newWidth;
    this.height = newHeight;
    this.grid = newGrid;
    this.nextGrid = new Uint8Array(newWidth * newHeight);
  }

  getIndex(x, y) {
    const wrappedX = (x + this.width) % this.width;
    const wrappedY = (y + this.height) % this.height;
    return wrappedY * this.width + wrappedX;
  }

  setCell(x, y, type) {
    this.grid[this.getIndex(x, y)] = type;
  }

  getCell(x, y) {
    return this.grid[this.getIndex(x, y)];
  }

  clear() {
    this.grid.fill(0);
    this.nextGrid.fill(0);
  }

  step() {
    this.gravityStep();
    this.antiGravityStep();
    this.caStep();
  }

  gravityStep() {
    for (let y = this.height - 2; y >= 0; y--) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const startX = dir === 1 ? 0 : this.width - 1;
      const endX = dir === 1 ? this.width : -1;
      
      for (let x = startX; x !== endX; x += dir) {
        const idx = y * this.width + x;
        const state = this.grid[idx];
        
        if (state === TYPE_SAND || state === TYPE_WATER || state === TYPE_LAVA) {
          const downY = y + 1;
          const leftX = (x - 1 + this.width) % this.width;
          const rightX = (x + 1) % this.width;
          
          const downIdx = downY * this.width + x;
          const dlIdx = downY * this.width + leftX;
          const drIdx = downY * this.width + rightX;
          const lIdx = y * this.width + leftX;
          const rIdx = y * this.width + rightX;
          
          let moved = false;
          
          // Try down
          if (this.grid[downIdx] === TYPE_EMPTY) {
            this.grid[downIdx] = state;
            this.grid[idx] = TYPE_EMPTY;
            moved = true;
          } else {
            // Try down-diagonals
            const leftFirst = Math.random() < 0.5;
            if (leftFirst) {
              if (this.grid[dlIdx] === TYPE_EMPTY) { this.grid[dlIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
              else if (this.grid[drIdx] === TYPE_EMPTY) { this.grid[drIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
            } else {
              if (this.grid[drIdx] === TYPE_EMPTY) { this.grid[drIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
              else if (this.grid[dlIdx] === TYPE_EMPTY) { this.grid[dlIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
            }
          }
          
          // Horizontal flow
          if (!moved) {
            let flowChance = 0;
            if (state === TYPE_WATER) flowChance = 0.2;
            else if (state === TYPE_LAVA) flowChance = 0.02; // Lava is very thick
            
            if (Math.random() < flowChance) {
              const leftFirst = Math.random() < 0.5;
              if (leftFirst) {
                if (this.grid[lIdx] === TYPE_EMPTY) { this.grid[lIdx] = state; this.grid[idx] = TYPE_EMPTY; }
                else if (this.grid[rIdx] === TYPE_EMPTY) { this.grid[rIdx] = state; this.grid[idx] = TYPE_EMPTY; }
              } else {
                if (this.grid[rIdx] === TYPE_EMPTY) { this.grid[rIdx] = state; this.grid[idx] = TYPE_EMPTY; }
                else if (this.grid[lIdx] === TYPE_EMPTY) { this.grid[lIdx] = state; this.grid[idx] = TYPE_EMPTY; }
              }
            }
          }
        }
      }
    }
  }

  antiGravityStep() {
    for (let y = 1; y < this.height; y++) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const startX = dir === 1 ? 0 : this.width - 1;
      const endX = dir === 1 ? this.width : -1;
      
      for (let x = startX; x !== endX; x += dir) {
        const idx = y * this.width + x;
        const state = this.grid[idx];
        
        if (state === TYPE_GAS) {
          const upY = y - 1;
          const leftX = (x - 1 + this.width) % this.width;
          const rightX = (x + 1) % this.width;
          
          const upIdx = upY * this.width + x;
          const ulIdx = upY * this.width + leftX;
          const urIdx = upY * this.width + rightX;
          const lIdx = y * this.width + leftX;
          const rIdx = y * this.width + rightX;
          
          let moved = false;
          
          if (this.grid[upIdx] === TYPE_EMPTY) {
            this.grid[upIdx] = state;
            this.grid[idx] = TYPE_EMPTY;
            moved = true;
          } else {
            const leftFirst = Math.random() < 0.5;
            if (leftFirst) {
              if (this.grid[ulIdx] === TYPE_EMPTY) { this.grid[ulIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
              else if (this.grid[urIdx] === TYPE_EMPTY) { this.grid[urIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
            } else {
              if (this.grid[urIdx] === TYPE_EMPTY) { this.grid[urIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
              else if (this.grid[ulIdx] === TYPE_EMPTY) { this.grid[ulIdx] = state; this.grid[idx] = TYPE_EMPTY; moved = true; }
            }
          }
          
          if (!moved && Math.random() < 0.4) {
            const leftFirst = Math.random() < 0.5;
            if (leftFirst) {
              if (this.grid[lIdx] === TYPE_EMPTY) { this.grid[lIdx] = state; this.grid[idx] = TYPE_EMPTY; }
              else if (this.grid[rIdx] === TYPE_EMPTY) { this.grid[rIdx] = state; this.grid[idx] = TYPE_EMPTY; }
            } else {
              if (this.grid[rIdx] === TYPE_EMPTY) { this.grid[rIdx] = state; this.grid[idx] = TYPE_EMPTY; }
              else if (this.grid[lIdx] === TYPE_EMPTY) { this.grid[lIdx] = state; this.grid[idx] = TYPE_EMPTY; }
            }
          }
        }
      }
    }
  }

  caStep() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const state = this.grid[idx];

        let life = 0, crystal = 0, acid = 0, wire = 0, lava = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + this.width) % this.width;
            const ny = (y + dy + this.height) % this.height;
            const neighbor = this.grid[ny * this.width + nx];
            
            if (neighbor === TYPE_LIFE) life++;
            else if (neighbor === TYPE_CRYSTAL) crystal++;
            else if (neighbor === TYPE_ACID) acid++;
            else if (neighbor === TYPE_WIRE) wire++;
            else if (neighbor === TYPE_LAVA) lava++;
          }
        }

        if (state === TYPE_EMPTY) {
          if (life === 3) this.nextGrid[idx] = TYPE_LIFE;
          else if ((crystal === 1 || crystal === 4) && Math.random() < 0.05) this.nextGrid[idx] = TYPE_CRYSTAL;
          else if (wire === 2) this.nextGrid[idx] = TYPE_WIRE;
          else this.nextGrid[idx] = TYPE_EMPTY;
        } 
        else if (state === TYPE_LIFE) {
          if (lava > 0) this.nextGrid[idx] = TYPE_GAS;
          else if (acid > 0) this.nextGrid[idx] = TYPE_ACID;
          else if (life === 2 || life === 3) this.nextGrid[idx] = TYPE_LIFE;
          else this.nextGrid[idx] = TYPE_EMPTY;
        } 
        else if (state === TYPE_CRYSTAL) {
          if (lava > 0) this.nextGrid[idx] = TYPE_GAS;
          else if (acid > 0) this.nextGrid[idx] = TYPE_ACID;
          else this.nextGrid[idx] = TYPE_CRYSTAL;
        } 
        else if (state === TYPE_ACID) {
          this.nextGrid[idx] = TYPE_EMPTY; // Burns out
        } 
        else if (state === TYPE_WIRE) {
          if (lava > 0) this.nextGrid[idx] = TYPE_GAS;
          else this.nextGrid[idx] = TYPE_TAIL;
        } 
        else if (state === TYPE_TAIL) {
          this.nextGrid[idx] = TYPE_EMPTY;
        } 
        else if (state === TYPE_WALL) {
          this.nextGrid[idx] = TYPE_WALL;
        }
        else if (state === TYPE_SAND || state === TYPE_WATER) {
          if (lava > 0) {
            this.nextGrid[idx] = TYPE_GAS; // Burns into gas
          }
          else if (acid > 0) {
            this.nextGrid[idx] = TYPE_ACID;
          } 
          else if (state === TYPE_WATER && (crystal === 1 || crystal === 4) && Math.random() < 0.05) {
            this.nextGrid[idx] = TYPE_CRYSTAL; 
          }
          else {
            this.nextGrid[idx] = state;
          }
        }
        else if (state === TYPE_LAVA) {
          this.nextGrid[idx] = TYPE_LAVA;
        }
        else if (state === TYPE_GAS) {
          // Dissipates over time
          if (Math.random() < 0.03) this.nextGrid[idx] = TYPE_EMPTY;
          else this.nextGrid[idx] = TYPE_GAS;
        }
      }
    }

    const temp = this.grid;
    this.grid = this.nextGrid;
    this.nextGrid = temp;
  }

  serialize() {
    const cells = [];
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i] > 0) cells.push([i, this.grid[i]]);
    }
    return btoa(JSON.stringify({ w: this.width, h: this.height, c: cells }));
  }

  deserialize(str) {
    try {
      const data = JSON.parse(atob(str));
      this.resize(data.w, data.h);
      this.clear();
      for (const [i, val] of data.c) {
        if (i < this.grid.length) this.grid[i] = val;
      }
      return true;
    } catch (e) {
      console.error("Failed to load save code", e);
      return false;
    }
  }
}
