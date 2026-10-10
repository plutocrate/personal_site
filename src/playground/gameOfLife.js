import { mount } from './util.js';

/**
 * Conway's Game of Life
 * Cellular automaton simulated on a discrete toroidal 2D lattice.
 * Supports interactive dragging to spawn live cells and gliders.
 */
export const startGameOfLife = (canvas) => mount(canvas, (s) => {
  // Cell dimensions
  const CELL_SIZE = 8;
  let cols = 0;
  let rows = 0;
  let grid = null;
  let nextGrid = null;
  let ageGrid = null; // Track cell age for subtle organic color transitions

  const initGrid = () => {
    const w = s.w || canvas.clientWidth || 600;
    const h = s.h || canvas.clientHeight || 400;
    cols = Math.max(16, Math.floor(w / CELL_SIZE));
    rows = Math.max(12, Math.floor(h / CELL_SIZE));

    grid = new Uint8Array(cols * rows);
    nextGrid = new Uint8Array(cols * rows);
    ageGrid = new Uint8Array(cols * rows);

    // Seed interesting random soup with clustered glider seeds
    for (let i = 0; i < cols * rows; i++) {
      if (Math.random() < 0.16) {
        grid[i] = 1;
        ageGrid[i] = 1;
      }
    }

    // Inject a classic Gosper / glider pattern near top-left center
    const cx = Math.floor(cols * 0.35);
    const cy = Math.floor(rows * 0.35);
    const glider = [
      [0, 1], [1, 2], [2, 0], [2, 1], [2, 2]
    ];
    glider.forEach(([dx, dy]) => {
      const idx = (cy + dy) * cols + (cx + dx);
      if (idx < grid.length) {
        grid[idx] = 1;
        ageGrid[idx] = 1;
      }
    });
  };

  initGrid();

  let lastSimStep = performance.now();
  const STEP_INTERVAL_MS = 65; // ~15 generations per sec for hypnotic, crisp pacing

  return (dt) => {
    const { ctx, w, h } = s;
    if (!w || !h) return;

    // Re-check grid sizing if canvas resized significantly
    const curCols = Math.floor(w / CELL_SIZE);
    const curRows = Math.floor(h / CELL_SIZE);
    if (curCols !== cols || curRows !== rows) {
      initGrid();
    }

    // Pointer drawing interaction: paint living cells under cursor
    if (s.mx != null && s.my != null && s.mx >= 0 && s.mx < w && s.my >= 0 && s.my < h) {
      const gx = Math.floor(s.mx / CELL_SIZE);
      const gy = Math.floor(s.my / CELL_SIZE);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = (gx + dx + cols) % cols;
          const ny = (gy + dy + rows) % rows;
          const idx = ny * cols + nx;
          grid[idx] = 1;
          ageGrid[idx] = 1;
        }
      }
    }

    const now = performance.now();
    if (now - lastSimStep >= STEP_INTERVAL_MS) {
      lastSimStep = now;

      // Compute next generation with toroidal wrapping
      for (let y = 0; y < rows; y++) {
        const yTop = (y - 1 + rows) % rows;
        const yBot = (y + 1) % rows;
        const rowIdx = y * cols;
        const topIdx = yTop * cols;
        const botIdx = yBot * cols;

        for (let x = 0; x < cols; x++) {
          const xLeft = (x - 1 + cols) % cols;
          const xRight = (x + 1) % cols;

          // 8 Moore neighbors sum
          const neighbors =
            grid[topIdx + xLeft] +
            grid[topIdx + x] +
            grid[topIdx + xRight] +
            grid[rowIdx + xLeft] +
            grid[rowIdx + xRight] +
            grid[botIdx + xLeft] +
            grid[botIdx + x] +
            grid[botIdx + xRight];

          const idx = rowIdx + x;
          const alive = grid[idx];

          if (alive) {
            // Survival rule: 2 or 3 living neighbors
            if (neighbors === 2 || neighbors === 3) {
              nextGrid[idx] = 1;
              ageGrid[idx] = Math.min(255, ageGrid[idx] + 1);
            } else {
              nextGrid[idx] = 0;
              ageGrid[idx] = 0;
            }
          } else {
            // Reproduction rule: exactly 3 living neighbors
            if (neighbors === 3) {
              nextGrid[idx] = 1;
              ageGrid[idx] = 1;
            } else {
              nextGrid[idx] = 0;
              ageGrid[idx] = 0;
            }
          }
        }
      }

      // Swap buffers
      const tmp = grid;
      grid = nextGrid;
      nextGrid = tmp;
    }

    // Render cells to canvas
    ctx.clearRect(0, 0, w, h);

    // Subtle dark vs light palette awareness
    const isDark = s.dark;
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.035)';

    // Draw subtle lattice grid lines
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) {
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, rows * CELL_SIZE);
    }
    for (let y = 0; y <= rows; y++) {
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(cols * CELL_SIZE, y * CELL_SIZE);
    }
    ctx.stroke();

    // Render living cells with smooth rounded squares and age glow
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (grid[idx]) {
          const age = ageGrid[idx];
          // Young cells tint fresh emerald/teal, older cells shift to deep vibrant cyan/mint
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          if (isDark) {
            const hue = Math.min(180, 140 + age * 2);
            ctx.fillStyle = `hsl(${hue}, 85%, ${Math.min(72, 58 + age)}%)`;
          } else {
            const hue = Math.min(175, 145 + age * 2);
            ctx.fillStyle = `hsl(${hue}, 80%, ${Math.max(34, 44 - age * 0.3)}%)`;
          }

          // Inset by 1px for clean segmented look
          ctx.beginPath();
          ctx.roundRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
          ctx.fill();
        }
      }
    }
  };
});
