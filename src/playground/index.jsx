import { startBoids } from './boids.js';
import { startGravity } from './gravity.js';
import { startSpringChain } from './springChain.js';
import { startGameOfLife } from './gameOfLife.js';
import { startDoublePendulum } from './doublePendulum.js';
import { startPhysicsSandbox } from './physicsSandbox.js';
import { startTeapot } from './teapot.js';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

/* ==========================================================================
   CONCEPT PLAYGROUND CMS / DATA STORE
   --------------------------------------------------------------------------
   Register physics simulations and concept playgrounds here.
   Each item provides live canvas animation and deep-dive technical writeups
   with physics formulation, algorithmic breakdown, excerpts, and complete
   production code.
   ========================================================================== */

export const sims = [
  {
    id: 'flock',
    title: 'Flock',
    hue: 210,
    start: startBoids,
    description: (
      <>
        <Highlight color="blue">A hundred boids</Highlight> following three rules: stay apart, match heading, drift toward the group. Move your pointer over the stage and the flock <Underline color="orange" variant="developer">scatters away</Underline> from it.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Overview & Emergent Flocking Dynamics',
      },
      {
        type: 'text',
        text: (
          <>
            Craig Reynolds’ seminal 1986 artificial life algorithm shows how lifelike collective behavior emerges from three purely local rules without any centralized leader or global coordinate knowledge.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. The Three Local Steering Laws & Predator Avoidance',
      },
      {
        type: 'text',
        text: (
          <>
            Each boid inspects neighboring flockmates within its perceptual horizon:
            <br />
            • <Highlight color="yellow">Separation</Highlight>: Steer to evade crowding nearby boids (<Underline color="rose" variant="default">d² &lt; 400</Underline>).
            <br />
            • <Highlight color="green">Alignment</Highlight>: Match average heading velocity vectors of flockmates.
            <br />
            • <Highlight color="blue">Cohesion</Highlight>: Steer towards the perceived local center of mass.
            <br />
            • <Highlight color="orange">Predator Flee</Highlight>: When the cursor enters proximity (<Underline color="orange" variant="developer">d² &lt; 12000</Underline>), a repulsive acceleration vector scatters boids outward smoothly.
          </>
        ),
      },
      {
        type: 'heading',
        text: '3. Key Algorithmic Excerpt',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Neighbor iteration: separation, alignment & cohesion
for (const q of b) {
  if (q === p) continue;
  const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
  if (d2 < 3600) {
    n++;
    ax += q.vx; ay += q.vy; // Alignment accumulator
    cx += q.x; cy += q.y;   // Cohesion accumulator
    if (d2 < 400) {         // Separation
      sx -= dx; sy -= dy;
    }
  }
}

// Gentle predator avoidance force
if (s.mx != null) {
  const dx = p.x - s.mx, dy = p.y - s.my, d2 = dx * dx + dy * dy;
  if (d2 < 12000) {
    const dist = Math.sqrt(d2 + 1);
    p.vx += (dx / dist) * 0.16 * dt;
    p.vy += (dy / dist) * 0.16 * dt;
  }
}`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

// Flocking: separation + alignment + cohesion. The pointer is a predator the flock flees from.
export const startBoids = (canvas) => mount(canvas, (s) => {
  const N = 110;
  const b = Array.from({ length: N }, () => ({
    x: Math.random() * 600,
    y: Math.random() * 400,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
  }));

  return (dt) => {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = s.dark ? '#f5f5f7' : '#1d1d1f';

    for (const p of b) {
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
      for (const q of b) {
        if (q === p) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 3600) {
          n++;
          ax += q.vx;
          ay += q.vy;
          cx += q.x;
          cy += q.y;
          if (d2 < 400) {
            sx -= dx;
            sy -= dy;
          }
        }
      }

      if (n) {
        p.vx += ((ax / n - p.vx) * 0.03 + (cx / n - p.x) * 0.0004 + sx * 0.015) * dt;
        p.vy += ((ay / n - p.vy) * 0.03 + (cy / n - p.y) * 0.0004 + sy * 0.015) * dt;
      }

      if (s.mx != null) {
        const dx = p.x - s.mx, dy = p.y - s.my, d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const dist = Math.sqrt(d2 + 1);
          p.vx += (dx / dist) * 0.16 * dt;
          p.vy += (dy / dist) * 0.16 * dt;
        }
      }

      const sp = Math.hypot(p.vx, p.vy) || 1, k = Math.min(Math.max(sp, 0.8), 1.8) / sp;
      p.vx *= k;
      p.vy *= k;
      p.x = (p.x + p.vx * dt * 0.9 + w) % w;
      p.y = (p.y + p.vy * dt * 0.9 + h) % h;

      const a = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-4, 3.2);
      ctx.lineTo(-4, -3.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Canvas 2D', 'Kinematics'],
  },
  {
    id: 'gravity-well',
    title: 'Gravity well',
    hue: 260,
    start: startGravity,
    description: (
      <>
        Particles orbiting a <Highlight color="purple">well of gravity</Highlight> that follows your pointer. Trails fade out slowly, like a <Underline color="blue" variant="long">long-exposure photograph</Underline> of the orbits.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Orbital Mechanics & Phosphor Persistence',
      },
      {
        type: 'text',
        text: (
          <>
            Test particles orbit an attractive barycenter tracking the pointer. Instead of blanking the screen every frame, a gentle composite wash attenuates existing alpha values, creating persistent long-exposure trails.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. Softened Gravitational Potential',
      },
      {
        type: 'text',
        text: (
          <>
            Newton’s inverse-square gravity accelerates particles toward the well. To prevent catastrophic division-by-zero singularities when particles pass directly through the cursor, a gravitational softening parameter (ε = 600) is added to the denominator.
          </>
        ),
      },
      {
        type: 'heading',
        text: '3. Key Algorithmic Excerpt',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Softened gravity calculation
const dx = well.x - p.x;
const dy = well.y - p.y;
const d2 = dx * dx + dy * dy + 600; // Softening parameter prevents infinity
const d = Math.sqrt(d2);
const f = 450 / d2;

p.vx += (dx / d) * f * dt;
p.vy += (dy / d) * f * dt;
p.vx *= 0.9996; // Viscous stability damping
p.vy *= 0.9996;

// Analog CRT phosphor decay
ctx.globalCompositeOperation = 'destination-out';
ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
ctx.fillRect(0, 0, w, h);
ctx.globalCompositeOperation = 'source-over';`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

// Particles orbiting a gravity well. The pointer drags the well; trails fade like long exposure.
export const startGravity = (canvas) => mount(canvas, (s) => {
  const N = 360;
  const ps = Array.from({ length: N }, () => {
    const a = Math.random() * 6.283;
    const r = 40 + Math.random() * 180;
    return { a, r, x: 0, y: 0, vx: -Math.sin(a) * 1.6, vy: Math.cos(a) * 1.6, init: false, r0: r };
  });

  const well = { x: 0, y: 0, ready: false };

  return (dt) => {
    const { ctx, w, h } = s;
    if (!well.ready) {
      well.x = w / 2;
      well.y = h / 2;
      well.ready = true;
      ps.forEach((p) => {
        p.x = well.x + Math.cos(p.a) * p.r;
        p.y = well.y + Math.sin(p.a) * p.r;
      });
    }

    const tx = s.mx ?? w / 2, ty = s.my ?? h / 2;
    well.x += (tx - well.x) * 0.04 * dt;
    well.y += (ty - well.y) * 0.04 * dt;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = s.dark ? '#f5f5f7' : '#1d1d1f';
    for (const p of ps) {
      const dx = well.x - p.x, dy = well.y - p.y;
      const d2 = dx * dx + dy * dy + 600, d = Math.sqrt(d2), f = 450 / d2;
      p.vx += (dx / d) * f * dt;
      p.vy += (dy / d) * f * dt;
      p.vx *= 0.9996;
      p.vy *= 0.9996;
      p.x += p.vx * dt * 0.75;
      p.y += p.vy * dt * 0.75;
      ctx.fillRect(p.x, p.y, 1.8, 1.8);
    }
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Canvas 2D', 'Astrophysics'],
  },
  {
    id: 'spring-chain',
    title: 'Spring chain',
    hue: 30,
    start: startSpringChain,
    description: (
      <>
        A chain of masses joined by springs that you can pull and release, with <Highlight color="yellow">real-time elasticity</Highlight> and smooth harmonic damping.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Hookean Elasticity & Linked Particles',
      },
      {
        type: 'text',
        text: (
          <>
            A series of 18 point masses interconnected by ideal springs. The first and last nodes are pinned as fixed anchors, while interior particles dynamically displace under Hooke’s restoring tension, gravitational pull, and viscous air damping.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. Restoring Force Mechanics & Bézier Interpolation',
      },
      {
        type: 'text',
        text: (
          <>
            For each neighboring pair, displacement from rest length yields an equal and opposite restoring force:
            <br />
            • <Underline color="blue" variant="default">F = -k · (dist - restLength)</Underline>
            <br />
            • When dragged, the target node smoothly tracks the pointer with damping factor 0.18.
            <br />
            • Midpoint quadratic Bézier curves connect all particles for a seamless, continuous ribbon.
          </>
        ),
      },
      {
        type: 'heading',
        text: '3. Key Algorithmic Excerpt',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Hooke's restoring tension between adjacent nodes
const dx = n2.x - n1.x;
const dy = n2.y - n1.y;
const dist = Math.hypot(dx, dy) || 0.001;
const diff = dist - restLen;
const force = diff * k; // F = k * Δx

const fx = (dx / dist) * force;
const fy = (dy / dist) * force;

if (!n1.pinned && i !== dragNodeIndex) {
  n1.vx += (fx / n1.mass) * dt;
  n1.vy += (fy / n1.mass) * dt;
}
if (!n2.pinned && i + 1 !== dragNodeIndex) {
  n2.vx -= (fx / n2.mass) * dt;
  n2.vy -= (fy / n2.mass) * dt;
}`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

// Interactive Spring Chain: Connected point masses responding to spring elasticity and pointer pull.
export const startSpringChain = (canvas) => mount(canvas, (s) => {
  const NUM_NODES = 18;
  const nodes = [];
  let initialized = false;

  const init = (w, h) => {
    nodes.length = 0;
    const startX = w * 0.16;
    const endX = w * 0.84;
    const baseY = h * 0.45;
    for (let i = 0; i < NUM_NODES; i++) {
      const t = i / (NUM_NODES - 1);
      nodes.push({
        x: startX + t * (endX - startX),
        y: baseY + Math.sin(t * Math.PI) * 25,
        vx: 0,
        vy: 0,
        pinned: i === 0 || i === NUM_NODES - 1,
        mass: 1.0,
      });
    }
  };

  let dragNodeIndex = -1;

  return (dt) => {
    const { ctx, w, h } = s;
    if (!initialized || nodes.length === 0) {
      init(w, h);
      initialized = true;
    }

    // Pointer interaction: drag closest node
    if (s.mx != null && s.my != null) {
      if (dragNodeIndex === -1) {
        let minDist = 50;
        nodes.forEach((node, idx) => {
          if (node.pinned) return;
          const d = Math.hypot(node.x - s.mx, node.y - s.my);
          if (d < minDist) {
            minDist = d;
            dragNodeIndex = idx;
          }
        });
      }
      if (dragNodeIndex !== -1) {
        const n = nodes[dragNodeIndex];
        n.x += (s.mx - n.x) * 0.18;
        n.y += (s.my - n.y) * 0.18;
        n.vx = 0;
        n.vy = 0;
      }
    } else {
      dragNodeIndex = -1;
    }

    const restLen = (w * 0.68) / (NUM_NODES - 1);
    const k = 0.12; // Lower spring stiffness for unhurried, graceful elasticity
    const damping = 0.96; // Higher damping so oscillation settles calmly
    const gravity = 0.08; // Gentle gravity

    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const diff = dist - restLen;
      const force = diff * k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!n1.pinned && i !== dragNodeIndex) {
        n1.vx += (fx / n1.mass) * dt;
        n1.vy += (fy / n1.mass) * dt;
      }
      if (!n2.pinned && i + 1 !== dragNodeIndex) {
        n2.vx -= (fx / n2.mass) * dt;
        n2.vy -= (fy / n2.mass) * dt;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.pinned || i === dragNodeIndex) continue;
      n.vy += gravity * dt;
      n.vx *= Math.pow(damping, dt);
      n.vy *= Math.pow(damping, dt);
      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }

    ctx.clearRect(0, 0, w, h);

    // Draw chain spine
    ctx.beginPath();
    ctx.strokeStyle = s.dark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(29, 29, 31, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      const xc = (nodes[i].x + nodes[i - 1].x) / 2;
      const yc = (nodes[i].y + nodes[i - 1].y) / 2;
      ctx.quadraticCurveTo(nodes[i - 1].x, nodes[i - 1].y, xc, yc);
    }
    ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
    ctx.stroke();

    // Draw masses / nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const isAnchor = n.pinned;
      const isDragged = i === dragNodeIndex;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isAnchor ? 5.5 : isDragged ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isAnchor
        ? (s.dark ? '#ffffff' : '#1d1d1f')
        : isDragged
        ? '#0071e3'
        : (s.dark ? 'rgba(255,255,255,0.85)' : 'rgba(29,29,31,0.85)');
      ctx.fill();
    }
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Canvas 2D', 'Classical Mechanics'],
  },
  {
    id: 'game-of-life',
    title: 'Game of life',
    hue: 150,
    start: startGameOfLife,
    description: (
      <>
        Conway’s iconic <Highlight color="green">cellular automaton</Highlight> simulated on an infinite toroidal grid. Simple local neighbor rules generate <Underline color="teal" variant="default">gliders, oscillators, and emergent digital life</Underline>. Click or drag across the stage to draw living cells.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Cellular Automata & Emergent Complexity',
      },
      {
        type: 'text',
        text: (
          <>
            Conway’s Game of Life (1970) proves that immense complexity, self-replication, and Turing completeness arise naturally from a discrete grid with just four zero-player deterministic rules.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. The Four Rules & Toroidal Topology',
      },
      {
        type: 'text',
        text: (
          <>
            Every cell interacts with its eight Moore neighbors (horizontal, vertical, diagonal) across a wrapped toroidal topology:
            <br />
            • <Highlight color="rose">Underpopulation</Highlight>: Any live cell with fewer than two live neighbors dies.
            <br />
            • <Highlight color="green">Survival</Highlight>: Any live cell with two or three live neighbors lives on to the next generation.
            <br />
            • <Highlight color="yellow">Overpopulation</Highlight>: Any live cell with more than three live neighbors dies.
            <br />
            • <Highlight color="blue">Reproduction</Highlight>: Any dead cell with exactly three live neighbors becomes a live cell.
          </>
        ),
      },
      {
        type: 'heading',
        text: '3. Key Algorithmic Excerpt',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// 8 Moore neighbors sum with toroidal coordinate wrapping
const neighbors =
  grid[topIdx + xLeft] + grid[topIdx + x] + grid[topIdx + xRight] +
  grid[rowIdx + xLeft] + grid[rowIdx + xRight] +
  grid[botIdx + xLeft] + grid[botIdx + x] + grid[botIdx + xRight];

const idx = rowIdx + x;
const alive = grid[idx];

// B3/S23 transition law
if (alive) {
  nextGrid[idx] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
} else {
  nextGrid[idx] = (neighbors === 3) ? 1 : 0;
}`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

/**
 * Conway's Game of Life
 * Cellular automaton simulated on a discrete toroidal 2D lattice.
 * Supports interactive dragging to spawn live cells and gliders.
 */
export const startGameOfLife = (canvas) => mount(canvas, (s) => {
  const CELL_SIZE = 8;
  let cols = 0;
  let rows = 0;
  let grid = null;
  let nextGrid = null;
  let ageGrid = null;

  const initGrid = () => {
    const w = s.w || canvas.clientWidth || 600;
    const h = s.h || canvas.clientHeight || 400;
    cols = Math.max(16, Math.floor(w / CELL_SIZE));
    rows = Math.max(12, Math.floor(h / CELL_SIZE));

    grid = new Uint8Array(cols * rows);
    nextGrid = new Uint8Array(cols * rows);
    ageGrid = new Uint8Array(cols * rows);

    for (let i = 0; i < cols * rows; i++) {
      if (Math.random() < 0.16) {
        grid[i] = 1;
        ageGrid[i] = 1;
      }
    }

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
  const STEP_INTERVAL_MS = 65;

  return (dt) => {
    const { ctx, w, h } = s;
    if (!w || !h) return;

    const curCols = Math.floor(w / CELL_SIZE);
    const curRows = Math.floor(h / CELL_SIZE);
    if (curCols !== cols || curRows !== rows) {
      initGrid();
    }

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

      for (let y = 0; y < rows; y++) {
        const yTop = (y - 1 + rows) % rows;
        const yBot = (y + 1) % rows;
        const rowIdx = y * cols;
        const topIdx = yTop * cols;
        const botIdx = yBot * cols;

        for (let x = 0; x < cols; x++) {
          const xLeft = (x - 1 + cols) % cols;
          const xRight = (x + 1) % cols;

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
            if (neighbors === 2 || neighbors === 3) {
              nextGrid[idx] = 1;
              ageGrid[idx] = Math.min(255, ageGrid[idx] + 1);
            } else {
              nextGrid[idx] = 0;
              ageGrid[idx] = 0;
            }
          } else {
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

      const tmp = grid;
      grid = nextGrid;
      nextGrid = tmp;
    }

    ctx.clearRect(0, 0, w, h);

    const isDark = s.dark;
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.035)';

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

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (grid[idx]) {
          const age = ageGrid[idx];
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          if (isDark) {
            const hue = Math.min(180, 140 + age * 2);
            ctx.fillStyle = \`hsl(\${hue}, 85%, \${Math.min(72, 58 + age)}%)\`;
          } else {
            const hue = Math.min(175, 145 + age * 2);
            ctx.fillStyle = \`hsl(\${hue}, 80%, \${Math.max(34, 44 - age * 0.3)}%)\`;
          }

          ctx.beginPath();
          ctx.roundRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
          ctx.fill();
        }
      }
    }
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Cellular Automata', 'Canvas 2D'],
  },
  {
    id: 'double-pendulum',
    title: 'Double pendulum',
    hue: 330,
    start: startDoublePendulum,
    description: (
      <>
        A chaotic system you can nudge. Two almost identical starting angles <Underline color="rose" variant="default">drift apart within seconds</Underline>, tracing intricate orbits.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Deterministic Chaos & Phase Space Divergence',
      },
      {
        type: 'text',
        text: (
          <>
            A classic physical demonstration of deterministic chaos. Two coupled pendulums have only two degrees of freedom and zero random noise, yet analytical prediction is impossible due to extreme sensitivity to initial conditions.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. Sub-Stepped Lagrangian Mechanics',
      },
      {
        type: 'text',
        text: (
          <>
            Derived using Lagrange’s equations d/dt(∂L/∂θ̇) - ∂L/∂θ = 0.
            <br />
            • <Underline color="rose" variant="default">Sub-stepping</Underline>: The physics loop executes 4 sub-steps per frame (subDt = dt · 0.38 / 4), completely eliminating numerical explosion.
            <br />
            • <Highlight color="purple">Safety Velocity Clamp</Highlight>: Bounds angular velocity to prevent high-speed centrifugal singularities.
            <br />
            • <Highlight color="rose">Attractor Trail</Highlight>: The lower bob’s motion traces a luminous fading orbit that illustrates the chaotic strange attractor.
          </>
        ),
      },
      {
        type: 'heading',
        text: '3. Key Algorithmic Excerpt',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Sub-stepped Lagrangian equations of motion
const substeps = 4;
const subDt = (dt * 0.38) / substeps;

for (let step = 0; step < substeps; step++) {
  const dth = th1 - th2;
  const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
  const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));

  const num1 = -g * (2 * m1 + m2) * Math.sin(th1) 
    - m2 * g * Math.sin(th1 - 2 * th2) 
    - 2 * Math.sin(dth) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(dth));

  const num2 = 2 * Math.sin(dth) * (w1 * w1 * l1 * (m1 + m2) 
    + g * (m1 + m2) * Math.cos(th1) 
    + w2 * w2 * l2 * m2 * Math.cos(dth));

  w1 += (num1 / (den1 || 1)) * subDt;
  w2 += (num2 / (den2 || 1)) * subDt;

  w1 *= 0.9996; w2 *= 0.9996; // Viscous drag
  th1 += w1 * subDt;
  th2 += w2 * subDt;
}`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

// Interactive Double Pendulum: Stable, slowed-down Lagrangian physics with sub-stepping.
export const startDoublePendulum = (canvas) => mount(canvas, (s) => {
  const g = 0.45; // Gentle gravity for unhurried, graceful cadence
  const l1 = 90, l2 = 82;
  const m1 = 10, m2 = 8;

  let th1 = Math.PI / 2 + 0.15;
  let th2 = Math.PI / 2 + 0.25;
  let w1 = 0;
  let w2 = 0;

  const trail = [];
  const MAX_TRAIL = 220;

  return (dt) => {
    const { ctx, w, h } = s;
    const cx = w / 2;
    const cy = h * 0.36;

    // Sub-stepping for rock-solid stability and zero numerical explosion
    const substeps = 4;
    const subDt = (dt * 0.38) / substeps; // Scale down overall speed to be calm and graceful

    for (let step = 0; step < substeps; step++) {
      // Gentle, smooth pointer nudge: only applies gentle torque if cursor is nearby, clamped safely
      if (s.mx != null && s.my != null) {
        const dx = s.mx - cx;
        const dy = s.my - cy;
        const targetAngle = Math.atan2(dx, dy);
        let diff = targetAngle - th1;
        // Normalize angle difference to [-PI, PI]
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const dist = Math.hypot(dx, dy);
        if (dist > 20 && dist < 320) {
          w1 += Math.sign(diff) * Math.min(Math.abs(diff) * 0.008, 0.04) * subDt;
        }
      }

      // Lagrangian equations of motion
      const dth = th1 - th2;
      const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));

      const num1 = -g * (2 * m1 + m2) * Math.sin(th1) 
        - m2 * g * Math.sin(th1 - 2 * th2) 
        - 2 * Math.sin(dth) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(dth));

      const num2 = 2 * Math.sin(dth) * (w1 * w1 * l1 * (m1 + m2) 
        + g * (m1 + m2) * Math.cos(th1) 
        + w2 * w2 * l2 * m2 * Math.cos(dth));

      const alpha1 = num1 / (den1 || 1);
      const alpha2 = num2 / (den2 || 1);

      w1 += alpha1 * subDt;
      w2 += alpha2 * subDt;

      // Natural drag damping + velocity ceiling so it can never blow up
      w1 *= 0.9996;
      w2 *= 0.9996;
      w1 = Math.max(-0.25, Math.min(0.25, w1));
      w2 = Math.max(-0.35, Math.min(0.35, w2));

      th1 += w1 * subDt;
      th2 += w2 * subDt;
    }

    // Compute bob positions
    const x1 = cx + l1 * Math.sin(th1);
    const y1 = cy + l1 * Math.cos(th1);
    const x2 = x1 + l2 * Math.sin(th2);
    const y2 = y1 + l2 * Math.cos(th2);

    trail.push({ x: x2, y: y2 });
    if (trail.length > MAX_TRAIL) trail.shift();

    // Render
    ctx.clearRect(0, 0, w, h);

    // Draw fading chaotic trail
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.45;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = \`rgba(225, 45, 110, \${alpha})\`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    }

    // Draw rods
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = s.dark ? 'rgba(255,255,255,0.45)' : 'rgba(29,29,31,0.45)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Draw center anchor
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = s.dark ? '#ffffff' : '#1d1d1f';
    ctx.fill();

    // Draw bob 1
    ctx.beginPath();
    ctx.arc(x1, y1, 6, 0, Math.PI * 2);
    ctx.fillStyle = s.dark ? '#e5e5ea' : '#3a3a3c';
    ctx.fill();

    // Draw bob 2
    ctx.beginPath();
    ctx.arc(x2, y2, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e12d6e';
    ctx.fill();
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Lagrangian Dynamics', 'Canvas 2D'],
  },
  {
    id: "2d-physics-sandbox",
    title: "WebAssembly 2D Physics Engine",
    hue: 35,
    start: startPhysicsSandbox,
    description: (
      <>
        High-performance <Highlight color="orange">native C physics engine</Highlight> compiled to <Underline color="teal" variant="developer">WebAssembly (WASM)</Underline>. Drop geometric primitives (circles, boxes, triangles, pentagons, beams), pull and slingshot shapes with <Underline color="rose" variant="designer">acceleration & inertia</Underline>, and simulate impulse momentum collision resolution at 60+ FPS.
      </>
    ),
    blocks: [
      {
        type: "heading",
        text: "1. Overview & Native WebAssembly Pipeline",
      },
      {
        type: "text",
        text: (
          <>
            This simulation runs a high-performance multi-body rigid dynamics and particle kernel authored in freestanding <b>C</b> and compiled directly into a compact 32-bit WebAssembly (WASM) binary using <code>clang</code> and <code>wasm-ld</code>. Position integration, pairwise momentum collision impulses, arena boundary bouncing, kinetic restitution, and spark particle dynamics all execute in near-bare-metal WASM linear memory.
          </>
        ),
      },
      {
        type: "heading",
        text: "2. Kinematics, Inertia & Slingshot Acceleration",
      },
      {
        type: "text",
        text: (
          <>
            Each rigid body tracks linear velocity <code>(vx, vy)</code>, angular velocity <code>(angle, va)</code>, mass, and coefficient of restitution:
            <br />
            • <b>Gravitational Acceleration</b>: Continuous downward force <code>vy += g * dt</code>.
            <br />
            • <b>Aerodynamic Drag & Friction</b>: Exponential decay factors <code>vx *= airDrag; vy *= airDrag;</code>.
            <br />
            • <b>Slingshot Impulse</b>: Grabbing and pulling any shape stretches a kinetic tether. On release, the vector calculates launch speed: <code>vx = cos(θ) * impulse; vy = sin(θ) * impulse;</code>.
          </>
        ),
      },
      {
        type: "code",
        code: `// C Kernel Step: Gravity, Drag, and Velocity Integration
float floorY = worldHeight - 18.0f;
float ceilY = 52.0f;
float leftX = 16.0f;
float rightX = worldWidth - 16.0f;

for (int i = 0; i < MAX_BODIES; i++) {
    if (!bodies[i].active) continue;
    Body* b = &bodies[i];

    // Force integration
    b->vy += gravityY * dt;
    b->vx *= airDrag;
    b->vy *= airDrag;
    b->va *= 0.99f;

    // Kinematic updates
    b->x += b->vx * dt;
    b->y += b->vy * dt;
    b->angle += b->va * dt;

    // Boundary bounce with restitution & friction
    if (b->y + b->radius > floorY) {
        b->y = floorY - b->radius;
        if (b->vy > 0.0f) {
            b->vy = -b->vy * b->restitution;
            b->vx *= surfaceFriction;
            b->va *= 0.85f;
            if (b->vy < -60.0f) emitSparks(b->x, floorY, b->colorIdx, 3);
        }
    }
}`,
      },
      {
        type: "heading",
        text: "3. Pairwise Impulse Momentum Collision Resolution",
      },
      {
        type: "text",
        text: (
          <>
            When two geometric bodies penetrate, the contact solver computes the normal vector, separates overlapping geometries along the collision axis, and transfers 1D impulse according to Newton's law of restitution:
          </>
        ),
      },
      {
        type: "code",
        code: `// Fast Distance & Collision Normal Resolution
float distSq = dx * dx + dy * dy;
float minDist = a->radius + b->radius;

if (distSq < minDist * minDist && distSq > 0.001f) {
    // Fast inverse square root
    float dist = distSq;
    float xhalf = 0.5f * dist;
    int i_val = *(int*)&dist;
    i_val = 0x5f3759df - (i_val >> 1);
    float invDist = *(float*)&i_val;
    invDist = invDist * (1.5f - xhalf * invDist * invDist);

    float nx = dx * invDist;
    float ny = dy * invDist;

    // Relative velocity along contact normal
    float rvx = b->vx - a->vx;
    float rvy = b->vy - a->vy;
    float velAlongNormal = rvx * nx + rvy * ny;

    if (velAlongNormal < 0.0f) {
        float e = a->restitution < b->restitution ? a->restitution : b->restitution;
        float invMassSum = (1.0f / a->mass) + (1.0f / b->mass);
        float impulse = -(1.0f + e) * velAlongNormal / invMassSum;

        a->vx -= (impulse * nx) / a->mass;
        a->vy -= (impulse * ny) / a->mass;
        b->vx += (impulse * nx) / b->mass;
        b->vy += (impulse * ny) / b->mass;
    }
}`,
      },
      {
        type: "heading",
        text: "4. WebAssembly Compilation Pipeline (Clang & wasm-ld)",
      },
      {
        type: "text",
        text: (
          <>
            The C source is compiled directly into a standalone 32-bit WebAssembly binary without needing Emscripten or large runtime overhead:
          </>
        ),
      },
      {
        type: "code",
        code: `clang --target=wasm32 -O3 -nostdlib \
  -Wl,--no-entry \
  -Wl,--export-all \
  -o public/wasm/physics_sim.wasm src/wasm/physics_sim.c`,
      },
      {
        type: "heading",
        text: "5. Complete C WebAssembly Physics Engine Source Code",
      },
      {
        type: "code",
        code: `// =============================================================================
// WebAssembly 2D Multi-Body Rigid & Particle Physics Kernel
// Author: Pratham Purohit
// Targets: freestanding wasm32 (-O3 -nostdlib)
// Features:
// - Multi-shape kinematics (Circle, Box, Triangle, Pentagon, Beam)
// - Gravitational acceleration & drag integration
// - Pairwise impulse collision resolution (Newton restitution)
// - Arena boundary reflections & surface friction
// - Slingshot kinetic impulse injection
// - Particle spark emitter
// =============================================================================

#define MAX_BODIES 48
#define MAX_SPARKS 96

// Shape primitive IDs
#define SHAPE_CIRCLE 0
#define SHAPE_RECT 1
#define SHAPE_TRIANGLE 2
#define SHAPE_PENTAGON 3
#define SHAPE_LINE 4

typedef struct {
    float x, y;
    float vx, vy;
    float angle, va;
    float radius;
    float w, h;
    float mass;
    float restitution;
    int shapeType;
    int colorIdx;
    int active;
} Body;

typedef struct {
    float x, y;
    float vx, vy;
    float life;
    float maxLife;
    int colorIdx;
    int active;
} Spark;

// Global world state
static Body bodies[MAX_BODIES];
static Spark sparks[MAX_SPARKS];

static float worldWidth = 800.0f;
static float worldHeight = 600.0f;
static float gravityY = 980.0f;
static float airDrag = 0.998f;
static float surfaceFriction = 0.94f;

// Deterministic PRNG
static unsigned int rng = 54321;
static float randF(void) {
    rng = (rng * 1664525u + 1013904223u);
    return (float)(rng & 0x7FFFFFFF) / 2147483648.0f;
}

// Spark emitter
static void emitSparks(float x, float y, int colorIdx, int count) {
    for (int k = 0; k < count; k++) {
        for (int i = 0; i < MAX_SPARKS; i++) {
            if (!sparks[i].active) {
                float ang = randF() * 6.2831853f;
                float spd = 40.0f + randF() * 120.0f;
                sparks[i].x = x;
                sparks[i].y = y;
                sparks[i].vx = spd * (float)(randF() - 0.5f) * 2.0f;
                sparks[i].vy = -spd * (0.3f + randF() * 0.7f);
                sparks[i].life = 0.0f;
                sparks[i].maxLife = 0.35f + randF() * 0.35f;
                sparks[i].colorIdx = colorIdx;
                sparks[i].active = 1;
                break;
            }
        }
    }
}

__attribute__((visibility("default")))
void initPhysicsWorld(float w, float h) {
    worldWidth = w;
    worldHeight = h;
    for (int i = 0; i < MAX_BODIES; i++) bodies[i].active = 0;
    for (int i = 0; i < MAX_SPARKS; i++) sparks[i].active = 0;
}

__attribute__((visibility("default")))
int spawnBody(int type, float x, float y, float vx, float vy, int colorIdx) {
    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) {
            Body* b = &bodies[i];
            b->shapeType = type;
            b->x = x;
            b->y = y;
            b->vx = vx;
            b->vy = vy;
            b->angle = (randF() - 0.5f) * 0.5f;
            b->va = (randF() - 0.5f) * 3.0f;
            b->colorIdx = colorIdx;
            b->restitution = 0.75f + randF() * 0.12f;
            b->active = 1;

            if (type == SHAPE_CIRCLE) {
                b->radius = 20.0f + randF() * 8.0f;
                b->w = b->radius * 2.0f;
                b->h = b->radius * 2.0f;
                b->mass = (b->radius * b->radius) / 400.0f;
            } else if (type == SHAPE_RECT) {
                b->w = 38.0f + randF() * 16.0f;
                b->h = 28.0f + randF() * 14.0f;
                b->radius = (b->w > b->h ? b->w : b->h) * 0.6f;
                b->mass = (b->w * b->h) / 600.0f;
            } else if (type == SHAPE_TRIANGLE) {
                float size = 34.0f + randF() * 12.0f;
                b->w = size;
                b->h = size;
                b->radius = size * 0.65f;
                b->mass = (size * size) / 500.0f;
            } else if (type == SHAPE_PENTAGON) {
                b->radius = 24.0f + randF() * 8.0f;
                b->w = b->radius * 2.0f;
                b->h = b->radius * 2.0f;
                b->mass = (b->radius * b->radius) / 380.0f;
            } else { // SHAPE_LINE / BEAM
                b->w = 60.0f + randF() * 20.0f;
                b->h = 10.0f;
                b->radius = b->w * 0.5f;
                b->mass = (b->w * b->h) / 300.0f;
            }

            emitSparks(x, y, colorIdx, 5);
            return i;
        }
    }
    return -1;
}

__attribute__((visibility("default")))
void applyImpulse(int index, float vx, float vy, float va) {
    if (index >= 0 && index < MAX_BODIES && bodies[index].active) {
        bodies[index].vx = vx;
        bodies[index].vy = vy;
        bodies[index].va = va;
        emitSparks(bodies[index].x, bodies[index].y, bodies[index].colorIdx, 8);
    }
}

__attribute__((visibility("default")))
void stepPhysics(float dt) {
    if (dt > 0.033f) dt = 0.033f;

    // 1. Update Sparks
    for (int i = 0; i < MAX_SPARKS; i++) {
        if (sparks[i].active) {
            sparks[i].x += sparks[i].vx * dt;
            sparks[i].y += sparks[i].vy * dt;
            sparks[i].vy += 450.0f * dt;
            sparks[i].life += dt;
            if (sparks[i].life >= sparks[i].maxLife) sparks[i].active = 0;
        }
    }

    // 2. Rigid Body Integration & Boundary Collisions
    float floorY = worldHeight - 18.0f;
    float ceilY = 52.0f;
    float leftX = 16.0f;
    float rightX = worldWidth - 16.0f;

    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) continue;
        Body* b = &bodies[i];

        // Gravitational acceleration & drag
        b->vy += gravityY * dt;
        b->vx *= airDrag;
        b->vy *= airDrag;
        b->va *= 0.99f;

        // Position & Angle Integration
        b->x += b->vx * dt;
        b->y += b->vy * dt;
        b->angle += b->va * dt;

        // Floor collision
        if (b->y + b->radius > floorY) {
            b->y = floorY - b->radius;
            if (b->vy > 0.0f) {
                b->vy = -b->vy * b->restitution;
                b->vx *= surfaceFriction;
                b->va *= 0.85f;
                if (b->vy < -60.0f) emitSparks(b->x, floorY, b->colorIdx, 3);
            }
        }
        // Ceiling
        if (b->y - b->radius < ceilY) {
            b->y = ceilY + b->radius;
            if (b->vy < 0.0f) b->vy = -b->vy * b->restitution;
        }
        // Left wall
        if (b->x - b->radius < leftX) {
            b->x = leftX + b->radius;
            if (b->vx < 0.0f) {
                b->vx = -b->vx * b->restitution;
                b->va += b->vy * 0.02f;
            }
        }
        // Right wall
        if (b->x + b->radius > rightX) {
            b->x = rightX - b->radius;
            if (b->vx > 0.0f) {
                b->vx = -b->vx * b->restitution;
                b->va -= b->vy * 0.02f;
            }
        }
    }

    // 3. Pairwise Impulse Collision Solver
    for (int i = 0; i < MAX_BODIES; i++) {
        if (!bodies[i].active) continue;
        Body* a = &bodies[i];

        for (int j = i + 1; j < MAX_BODIES; j++) {
            if (!bodies[j].active) continue;
            Body* b = &bodies[j];

            float dx = b->x - a->x;
            float dy = b->y - a->y;
            float distSq = dx * dx + dy * dy;
            float minDist = a->radius + b->radius;

            if (distSq < minDist * minDist && distSq > 0.001f) {
                // Approximate square root via fast iterations
                float dist = distSq;
                // Basic Newton-Raphson for dist = sqrt(distSq)
                float xhalf = 0.5f * dist;
                int i_val = *(int*)&dist;
                i_val = 0x5f3759df - (i_val >> 1);
                float invDist = *(float*)&i_val;
                invDist = invDist * (1.5f - xhalf * invDist * invDist);
                dist = distSq * invDist;

                float nx = dx * invDist;
                float ny = dy * invDist;

                // De-penetration
                float overlap = minDist - dist;
                a->x -= nx * overlap * 0.5f;
                a->y -= ny * overlap * 0.5f;
                b->x += nx * overlap * 0.5f;
                b->y += ny * overlap * 0.5f;

                // Relative velocity
                float rvx = b->vx - a->vx;
                float rvy = b->vy - a->vy;
                float velAlongNormal = rvx * nx + rvy * ny;

                if (velAlongNormal < 0.0f) {
                    float e = a->restitution < b->restitution ? a->restitution : b->restitution;
                    float invMassSum = (1.0f / a->mass) + (1.0f / b->mass);
                    float impulse = -(1.0f + e) * velAlongNormal / invMassSum;

                    float impX = impulse * nx;
                    float impY = impulse * ny;

                    a->vx -= impX / a->mass;
                    a->vy -= impY / a->mass;
                    b->vx += impX / b->mass;
                    b->vy += impY / b->mass;

                    a->va += (randF() - 0.5f) * 4.0f;
                    b->va += (randF() - 0.5f) * 4.0f;

                    if (velAlongNormal < -100.0f) {
                        emitSparks(a->x + nx * a->radius, a->y + ny * a->radius, a->colorIdx, 4);
                    }
                }
            }
        }
    }
}

// Memory buffer accessors for JS
__attribute__((visibility("default")))
void* getBodiesBuffer(void) { return (void*)bodies; }

__attribute__((visibility("default")))
int getMaxBodies(void) { return MAX_BODIES; }

__attribute__((visibility("default")))
void* getSparksBuffer(void) { return (void*)sparks; }

__attribute__((visibility("default")))
int getMaxSparks(void) { return MAX_SPARKS; }
`,
      },
    ],
    stack: ['WebAssembly', 'C', 'Clang', 'Rigid Body Physics', 'Canvas 2D'],
  },


  {
    id: "utah-teapot-raylib",
    title: "3D Utah Teapot Dynamics",
    hue: 200,
    start: startTeapot,
    description: (
      <>
        Iconic <Highlight color="blue">3D Utah Teapot parametric mesh</Highlight> with <Underline color="teal" variant="developer">Raylib-style rendering pipeline</Underline> and continuous gyroscopic rotation compiled to <Underline color="rose" variant="designer">WebAssembly (WASM)</Underline>. Constantly auto-rotates in 3D space; drag and flick to impart additive rotational torque with natural inertial damping.
      </>
    ),
    blocks: [
      {
        type: "heading",
        text: "1. Overview & 3D Utah Teapot History",
      },
      {
        type: "text",
        text: (
          <>
            The Utah Teapot (created in 1975 by Martin Newell at the University of Utah) is computer graphics' most famous benchmark object. This project implements a freestanding 3D graphics and angular physics pipeline in <b>C (Raylib graphics architecture)</b>, compiled to a zero-overhead WebAssembly binary with <code>clang</code>. The engine continuously rotates the parametric manifold in real time while allowing interactive user torque flicks.
          </>
        ),
      },
      {
        type: "heading",
        text: "2. Parametric Geometry & Topology Generation",
      },
      {
        type: "text",
        text: (
          <>
            The C kernel synthesizes the complete 3D manifold:
            <br />
            • <b>Body Rings</b>: Lathed parametric splines connecting 7 radial cross-sections across 14 longitudinal ribs.<br />
            • <b>Lid & Knob</b>: Octagonal conic cap with centered apex vertex.<br />
            • <b>Curved Spout</b>: Multi-tier tubular loft with tapering radius vectors.<br />
            • <b>Loop Handle</b>: Elliptical torus arc spanning from upper rim to lower body.
          </>
        ),
      },
      {
        type: "heading",
        text: "3. Continuous Auto-Rotation & Euler Matrix Transformation",
      },
      {
        type: "text",
        text: (
          <>
            The C kernel maintains a steady baseline angular velocity <code>state.baseSpin</code> (0.85 rad/s) combined with user flick torque. To ensure completely glitch-free, infinite rotational continuity without drift, trigonometry uses a high-precision Bhaskara I approximation formula with O(1) modulo angle wrapping:
          </>
        ),
      },
      {
        type: "code",
        code: `// Continuous Auto-Rotation & Euler Transformation in C
state.ry += (state.baseSpin + state.vy_rot) * dt;
state.rx += state.vx_rot * dt;

// Smooth exponential decay of added user flick torque back to steady spin
state.vx_rot *= 0.94f;
state.vy_rot *= 0.94f;

// 3D Euler Transformation Matrix (Yaw Y, Pitch X)
float cy = cosF(state.ry);
float sy = sinF(state.ry);
float cx = cosF(state.rx);
float sx = sinF(state.rx);

for (int i = 0; i < vertexCount; i++) {
    Vec3 v = baseVertices[i];

    // Yaw around Y
    float x1 = v.x * cy + v.z * sy;
    float y1 = v.y;
    float z1 = -v.x * sy + v.z * cy;

    // Pitch around X
    float x2 = x1;
    float y2 = y1 * cx - z1 * sx;
    float z2 = y1 * sx + z1 * cx;

    transformedVertices[i].x = x2;
    transformedVertices[i].y = y2;
    transformedVertices[i].z = z2;
}`,
      },
      {
        type: "heading",
        text: "4. Compilation Pipeline (Clang & WebAssembly)",
      },
      {
        type: "text",
        text: (
          <>
            Compile the freestanding C kernel into high-speed WebAssembly:
          </>
        ),
      },
      {
        type: "code",
        code: `clang --target=wasm32 -O3 -nostdlib \
  -Wl,--no-entry \
  -Wl,--export-all \
  -o public/wasm/teapot_sim.wasm src/wasm/teapot_sim.c`,
      },
      {
        type: "heading",
        text: "5. Complete C Raylib-Style 3D Engine Source Code",
      },
      {
        type: "code",
        code: `// =============================================================================
// Raylib-Style 3D Utah Teapot Rendering & Continuous Inertia Kernel
// Author: Pratham Purohit
// Targets: freestanding wasm32 (-O3 -nostdlib)
// Features:
// - Parametric Utah Teapot 3D mesh (Body rings, lid knob, spout, loop handle)
// - Robust continuous Euler rotation (Bhaskara trigonometric polynomial)
// - Constant smooth ambient rotation + additive drag flick torque
// - 3D affine matrix transformation & depth cueing
// =============================================================================

#define MAX_VERTICES 320
#define MAX_EDGES 480
#define PI 3.14159265358979323846f
#define TWO_PI 6.28318530717958647692f

typedef struct {
    float x, y, z;
} Vec3;

typedef struct {
    int v0, v1;
} Edge;

typedef struct {
    float x, y, z;
    float rx, ry, rz;       // Continuous Euler angles (radians)
    float vx_rot, vy_rot;   // Dynamic angular momentum
    float baseSpin;         // Constant base rotation speed (rad/s)
    float scale;
} TeapotState;

static TeapotState state;
static Vec3 baseVertices[MAX_VERTICES];
static Vec3 transformedVertices[MAX_VERTICES];
static Edge edges[MAX_EDGES];
static int vertexCount = 0;
static int edgeCount = 0;

// High-fidelity Bhaskara I trigonometric approximation (Max error < 0.0016 across all angles)
// Fast O(1) execution without loops or drift over indefinite rotations
static float sinF(float x) {
    // Wrap to [0, TWO_PI)
    if (x < 0.0f) {
        float k = (float)((int)(-x / TWO_PI) + 1);
        x += k * TWO_PI;
    }
    if (x >= TWO_PI) {
        float k = (float)((int)(x / TWO_PI));
        x -= k * TWO_PI;
    }

    if (x <= PI) {
        float num = 16.0f * x * (PI - x);
        float den = 5.0f * PI * PI - 4.0f * x * (PI - x);
        return num / den;
    } else {
        x -= PI;
        float num = 16.0f * x * (PI - x);
        float den = 5.0f * PI * PI - 4.0f * x * (PI - x);
        return -(num / den);
    }
}

static float cosF(float x) {
    return sinF(x + PI * 0.5f);
}

static void addVertex(float x, float y, float z) {
    if (vertexCount < MAX_VERTICES) {
        baseVertices[vertexCount].x = x;
        baseVertices[vertexCount].y = y;
        baseVertices[vertexCount].z = z;
        vertexCount++;
    }
}

static void addEdge(int v0, int v1) {
    if (edgeCount < MAX_EDGES) {
        edges[edgeCount].v0 = v0;
        edges[edgeCount].v1 = v1;
        edgeCount++;
    }
}

// Procedurally generate the iconic Utah Teapot geometric topology
static void generateTeapotGeometry(void) {
    vertexCount = 0;
    edgeCount = 0;

    // Body rings (lathe of teapot profile)
    int latSegments = 7;
    int lonSegments = 14;
    float bodyRadii[7] = { 0.45f, 0.95f, 1.25f, 1.35f, 1.2f, 0.85f, 0.7f };
    float bodyY[7]     = { -0.7f, -0.45f, -0.15f, 0.15f, 0.45f, 0.7f,  0.8f };

    for (int lat = 0; lat < latSegments; lat++) {
        float r = bodyRadii[lat];
        float y = bodyY[lat];
        for (int lon = 0; lon < lonSegments; lon++) {
            float phi = (TWO_PI * (float)lon) / (float)lonSegments;
            addVertex(r * cosF(phi), y, r * sinF(phi));
        }
    }

    // Connect body rings and longitudinal ribs
    for (int lat = 0; lat < latSegments; lat++) {
        int base = lat * lonSegments;
        for (int lon = 0; lon < lonSegments; lon++) {
            int nextLon = (lon + 1) % lonSegments;
            addEdge(base + lon, base + nextLon);
            if (lat < latSegments - 1) {
                addEdge(base + lon, base + lonSegments + lon);
            }
        }
    }

    // Lid knob
    int lidBase = vertexCount;
    addVertex(0.0f, 1.05f, 0.0f);
    for (int i = 0; i < 8; i++) {
        float phi = (TWO_PI * (float)i) / 8.0f;
        addVertex(0.22f * cosF(phi), 0.92f, 0.22f * sinF(phi));
        addEdge(lidBase, lidBase + 1 + i);
        addEdge(lidBase + 1 + i, lidBase + 1 + ((i + 1) % 8));
    }

    // Spout curve
    int spoutBase = vertexCount;
    float spoutProfileX[5] = { 1.05f, 1.45f, 1.85f, 2.15f, 2.3f };
    float spoutProfileY[5] = { 0.05f, 0.35f, 0.7f, 1.05f, 1.2f };
    float spoutRadius[5]   = { 0.24f, 0.2f, 0.16f, 0.13f, 0.11f };

    for (int s = 0; s < 5; s++) {
        float sx = spoutProfileX[s];
        float sy = spoutProfileY[s];
        float sr = spoutRadius[s];
        for (int k = 0; k < 6; k++) {
            float th = (TWO_PI * (float)k) / 6.0f;
            addVertex(sx + sr * cosF(th) * 0.4f, sy + sr * sinF(th), sr * cosF(th));
        }
    }
    for (int s = 0; s < 4; s++) {
        int b1 = spoutBase + s * 6;
        int b2 = spoutBase + (s + 1) * 6;
        for (int k = 0; k < 6; k++) {
            int nk = (k + 1) % 6;
            addEdge(b1 + k, b1 + nk);
            addEdge(b1 + k, b2 + k);
        }
    }
    for (int k = 0; k < 6; k++) addEdge(spoutBase + 24 + k, spoutBase + 24 + ((k + 1) % 6));

    // Handle loop
    int handleBase = vertexCount;
    for (int h = 0; h < 9; h++) {
        float ang = PI * 0.45f + ((float)h / 8.0f) * PI * 1.1f;
        float hx = -1.25f - 0.75f * cosF(ang);
        float hy = 0.2f + 0.65f * sinF(ang);
        addVertex(hx, hy, 0.08f);
        addVertex(hx, hy, -0.08f);
        if (h > 0) {
            addEdge(handleBase + (h - 1) * 2, handleBase + h * 2);
            addEdge(handleBase + (h - 1) * 2 + 1, handleBase + h * 2 + 1);
            addEdge(handleBase + h * 2, handleBase + h * 2 + 1);
        }
    }
}

__attribute__((visibility("default")))
void initTeapot(void) {
    generateTeapotGeometry();
    state.rx = 0.38f;
    state.ry = 0.0f;
    state.rz = 0.0f;
    state.vx_rot = 0.0f;
    state.vy_rot = 0.0f;
    state.baseSpin = 0.85f; // Constant steady auto-rotation speed (rad/sec)
    state.scale = 100.0f;
}

__attribute__((visibility("default")))
void addTeapotTorque(float dPitch, float dYaw) {
    state.vx_rot += dPitch;
    state.vy_rot += dYaw;
}

__attribute__((visibility("default")))
void updateTeapot(float dt) {
    if (dt > 0.05f) dt = 0.05f;

    // 1. Continuous auto-rotation + dynamic user momentum
    state.ry += (state.baseSpin + state.vy_rot) * dt;
    state.rx += state.vx_rot * dt;

    // Keep pitch bounded comfortably so teapot never flips upside-down awkwardly
    if (state.rx > 0.85f) state.rx = 0.85f;
    if (state.rx < -0.45f) state.rx = -0.45f;

    // Wrap yaw cleanly to [0, TWO_PI)
    if (state.ry >= TWO_PI) {
        float k = (float)((int)(state.ry / TWO_PI));
        state.ry -= k * TWO_PI;
    } else if (state.ry < 0.0f) {
        float k = (float)((int)(-state.ry / TWO_PI) + 1);
        state.ry += k * TWO_PI;
    }

    // 2. Smooth exponential decay of added user flick torque back to steady base rotation
    state.vx_rot *= 0.94f;
    state.vy_rot *= 0.94f;

    // 3. 3D Euler Transformation Matrix (Yaw Y, Pitch X)
    float cy = cosF(state.ry);
    float sy = sinF(state.ry);
    float cx = cosF(state.rx);
    float sx = sinF(state.rx);

    for (int i = 0; i < vertexCount; i++) {
        Vec3 v = baseVertices[i];

        // Yaw around Y
        float x1 = v.x * cy + v.z * sy;
        float y1 = v.y;
        float z1 = -v.x * sy + v.z * cy;

        // Pitch around X
        float x2 = x1;
        float y2 = y1 * cx - z1 * sx;
        float z2 = y1 * sx + z1 * cx;

        transformedVertices[i].x = x2;
        transformedVertices[i].y = y2;
        transformedVertices[i].z = z2;
    }
}

__attribute__((visibility("default")))
int getVertexCount(void) { return vertexCount; }

__attribute__((visibility("default")))
int getEdgeCount(void) { return edgeCount; }

__attribute__((visibility("default")))
void* getTransformedVertices(void) { return (void*)transformedVertices; }

__attribute__((visibility("default")))
void* getEdges(void) { return (void*)edges; }

__attribute__((visibility("default")))
float getRotationY(void) { return state.ry; }

__attribute__((visibility("default")))
float getRotationX(void) { return state.rx; }
`,
      },
    ],
    stack: ['WebAssembly', 'C', 'Raylib Graphics', '3D Linear Algebra', 'Canvas 2D'],
  },
];
