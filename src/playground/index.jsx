import { startBoids } from './boids.js';
import { startGravity } from './gravity.js';
import { startSpringChain } from './springChain.js';
import { startReactionDiffusion } from './reactionDiffusion.js';
import { startDoublePendulum } from './doublePendulum.js';
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
    meta: 'Live',
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
    meta: 'Live',
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
    meta: 'Live',
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
    id: 'reaction-diffusion',
    title: 'Reaction diffusion',
    meta: 'Live',
    hue: 150,
    start: startReactionDiffusion,
    description: (
      <>
        Two chemicals feeding and consuming each other, generating <Underline color="teal" variant="default">coral and spot patterns</Underline>. Drag across the canvas to seed <Highlight color="green">new biological reactions</Highlight>.
      </>
    ),
    blocks: [
      {
        type: 'heading',
        text: '1. Morphogenesis & The Gray-Scott PDE Model',
      },
      {
        type: 'text',
        text: (
          <>
            Alan Turing demonstrated that complex organic patterns (leopard spots, zebra stripes, and coral reefs) arise naturally from the reaction and differential diffusion of chemical morphogens.
          </>
        ),
      },
      {
        type: 'heading',
        text: '2. Differential Diffusion & Discrete Laplacian Grids',
      },
      {
        type: 'text',
        text: (
          <>
            Two chemical fields U and V diffuse across a discrete grid. The reaction converts chemical U into V in the presence of existing V (autocatalysis UV²):
            <br />
            • <Underline color="teal" variant="default">∂U/∂t = Du · ∇²U - U·V² + F·(1 - U)</Underline>
            <br />
            • <Underline color="green" variant="default">∂V/∂t = Dv · ∇²V + U·V² - (F + K)·V</Underline>
            <br />
            • Dragging injects morphogen V, generating ripples and spiraling biological structures.
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
        code: `// 5-point discrete Laplacian convolution
const lapU = (u[i - 1] + u[i + 1] + u[i - GW] + u[i + GW] - 4 * curU) * 0.2;
const lapV = (v[i - 1] + v[i + 1] + v[i - GW] + v[i + GW] - 4 * curV) * 0.2;
const uvv = curU * curV * curV;

// Gray-Scott reaction update
nextU[i] = Math.max(0, Math.min(1, curU + (Du * lapU - uvv + F * (1.0 - curU))));
nextV[i] = Math.max(0, Math.min(1, curV + (Dv * lapV + uvv - (F + K) * curV)));`,
      },
      {
        type: 'heading',
        text: '4. Full Simulation Source Code',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `import { mount } from './util.js';

// Interactive Reaction Diffusion (Gray-Scott model on a high-speed simulation grid)
export const startReactionDiffusion = (canvas) => mount(canvas, (s) => {
  const GW = 140, GH = 90;
  let u = new Float32Array(GW * GH);
  let v = new Float32Array(GW * GH);
  let nextU = new Float32Array(GW * GH);
  let nextV = new Float32Array(GW * GH);

  // Initialize homogeneous field with chemical seeds in the center
  for (let i = 0; i < GW * GH; i++) {
    u[i] = 1.0;
    v[i] = 0.0;
  }
  for (let y = GH * 0.4; y < GH * 0.6; y++) {
    for (let x = GW * 0.4; x < GW * 0.6; x++) {
      const idx = Math.floor(y) * GW + Math.floor(x);
      u[idx] = 0.5 + Math.random() * 0.05;
      v[idx] = 0.25 + Math.random() * 0.05;
    }
  }

  // Offscreen canvas for fast pixel blitting
  const offscreen = document.createElement('canvas');
  offscreen.width = GW;
  offscreen.height = GH;
  const offCtx = offscreen.getContext('2d');
  const imgData = offCtx.createImageData(GW, GH);

  const Du = 0.2097, Dv = 0.105, F = 0.0545, K = 0.062;

  const step = () => {
    for (let y = 1; y < GH - 1; y++) {
      for (let x = 1; x < GW - 1; x++) {
        const i = y * GW + x;
        const curU = u[i], curV = v[i];
        const lapU = (u[i - 1] + u[i + 1] + u[i - GW] + u[i + GW] - 4 * curU) * 0.2;
        const lapV = (v[i - 1] + v[i + 1] + v[i - GW] + v[i + GW] - 4 * curV) * 0.2;
        const uvv = curU * curV * curV;

        nextU[i] = Math.max(0, Math.min(1, curU + (Du * lapU - uvv + F * (1.0 - curU))));
        nextV[i] = Math.max(0, Math.min(1, curV + (Dv * lapV + uvv - (F + K) * curV)));
      }
    }
    const tmpU = u; u = nextU; nextU = tmpU;
    const tmpV = v; v = nextV; nextV = tmpV;
  };

  return () => {
    const { ctx, w, h } = s;

    // Inject chemical V on pointer position gently
    if (s.mx != null && s.my != null && w > 0 && h > 0) {
      const gx = Math.floor((s.mx / w) * GW);
      const gy = Math.floor((s.my / h) * GH);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = gx + dx, ny = gy + dy;
          if (nx >= 1 && nx < GW - 1 && ny >= 1 && ny < GH - 1) {
            v[ny * GW + nx] = 0.55;
            u[ny * GW + nx] = 0.35;
          }
        }
      }
    }

    // Step physics once per frame for calm, deliberate diffusion rate
    step();

    // Render image buffer
    const d = imgData.data;
    for (let i = 0; i < GW * GH; i++) {
      const val = Math.max(0, Math.min(1, u[i] - v[i]));
      const p = i * 4;
      const intensity = Math.floor(val * 240);
      d[p] = intensity;
      d[p + 1] = Math.floor(intensity * 0.96);
      d[p + 2] = Math.floor(intensity * 0.92);
      d[p + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, w, h);
  };
});`,
      },
    ],
    stack: ['JavaScript', 'Grid PDE', 'Canvas 2D'],
  },
  {
    id: 'double-pendulum',
    title: 'Double pendulum',
    meta: 'Live',
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
];
