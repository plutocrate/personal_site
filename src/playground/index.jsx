import { startBoids } from './boids.js';
import { startGravity } from './gravity.js';
import { startSpringChain } from './springChain.js';
import { startReactionDiffusion } from './reactionDiffusion.js';
import { startDoublePendulum } from './doublePendulum.js';
import { mk } from '../data/blocks.js';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

/* ==========================================================================
   CONCEPT PLAYGROUND CMS / DATA STORE
   --------------------------------------------------------------------------
   Register physics simulations and concept playgrounds here.
   - `start`: Animation starter function `start(canvas) => stop`
   - `start: null`: Displays "Coming soon" state.
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
        text: 'Overview & Emergent Flocking Dynamics',
      },
      {
        type: 'text',
        text: (
          <>
            Craig Reynolds’ classic 1986 artificial life model demonstrates how complex collective behaviors emerge from simple local interactions. A flock of 110 autonomous agents navigates 2D Euclidean space without any centralized hierarchy or omniscient leader.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'The Three Local Steering Laws',
      },
      {
        type: 'text',
        text: (
          <>
            Each boid samples neighbors within its sensory radius and applies three steering forces every frame:
            <br />
            1. <Highlight color="yellow">Separation</Highlight>: Steer to avoid crowding local flockmates within a short critical radius (prevents collisions).
            <br />
            2. <Highlight color="green">Alignment</Highlight>: Steer towards the average heading and velocity vector of neighbors.
            <br />
            3. <Highlight color="blue">Cohesion</Highlight>: Steer towards the center of mass (average position) of nearby flockmates.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'Core Implementation',
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Neighbor interaction loop
for (const q of b) {
  if (q === p) continue;
  const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
  if (d2 < 3600) { // Sensory neighborhood
    n++;
    ax += q.vx; ay += q.vy; // Alignment
    cx += q.x; cy += q.y;   // Cohesion
    if (d2 < 400) {         // Close proximity separation
      sx -= dx; sy -= dy;
    }
  }
}

// Predator avoidance force
if (s.mx != null) {
  const dx = p.x - s.mx, dy = p.y - s.my, d2 = dx * dx + dy * dy;
  if (d2 < 14400) {
    p.vx += (dx / Math.sqrt(d2 + 1)) * 0.35 * dt;
    p.vy += (dy / Math.sqrt(d2 + 1)) * 0.35 * dt;
  }
}`,
      },
      {
        type: 'heading',
        text: 'Predator Avoidance & Continuous Gestures',
      },
      {
        type: 'text',
        text: (
          <>
            The user’s pointer acts as a dynamic predator with an inverse-distance repulsive field. Rather than abruptly overriding trajectory vectors, the avoidance acceleration seamlessly pipes through the same kinematic speed limiter, keeping flock gestures natural and fluid.
          </>
        ),
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
        text: 'Orbital Mechanics & Long-Exposure Phosphor',
      },
      {
        type: 'text',
        text: (
          <>
            This simulation models 360 test particles subjected to Newtonian gravitational acceleration. Instead of clearing the frame buffer completely on each animation tick, canvas pixels are gently attenuated using an alpha-decay composite operation, creating a persistent trace reminiscent of analog oscilloscope phosphors.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'Softened Gravitational Potential',
      },
      {
        type: 'text',
        text: (
          <>
            In pure Newtonian gravity, force diverges to infinity as distance approaches zero (F = G / r²). To prevent catastrophic velocity spikes when a particle passes through the cursor, we introduce a softening parameter ε = 400 into the denominator:
          </>
        ),
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Softened inverse-square law
const dx = well.x - p.x;
const dy = well.y - p.y;
const d2 = dx * dx + dy * dy + 400; // Softening parameter
const d = Math.sqrt(d2);
const f = 900 / d2;

// Apply acceleration step
p.vx += (dx / d) * f * dt;
p.vy += (dy / d) * f * dt;

// Slow exponential frame attenuation for trails
ctx.globalCompositeOperation = 'destination-out';
ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
ctx.fillRect(0, 0, w, h);
ctx.globalCompositeOperation = 'source-over';`,
      },
      {
        type: 'heading',
        text: 'Emergent Chaos & Orbital Ellipses',
      },
      {
        type: 'text',
        text: (
          <>
            As the mouse glides across the stage, the gravitational barycenter displaces non-inertially. Orbits precess, deform into rosettes, and collapse into spiral accretion streams that reveal the geometry of the moving vector field.
          </>
        ),
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
        text: 'Hookean Spring Elasticity & Verlet Integration',
      },
      {
        type: 'text',
        text: (
          <>
            Spring Chain simulates an interconnected lattice of 18 point masses linked by ideal linear springs. The two boundary endpoints are fixed as kinematic anchors, while interior nodes respond to Hooke’s restoring force, gravity, and drag.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'Coupled Restoring Force Formulation',
      },
      {
        type: 'text',
        text: (
          <>
            For each adjacent node pair (i, i+1), the displacement relative to the equilibrium rest length determines the mutual tension or compression vector:
          </>
        ),
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Hooke's Law: F = -k * (x - x_0)
const dx = n2.x - n1.x;
const dy = n2.y - n1.y;
const dist = Math.hypot(dx, dy) || 0.001;
const diff = dist - restLen;
const force = diff * k;

const fx = (dx / dist) * force;
const fy = (dy / dist) * force;

if (!n1.pinned) { n1.vx += (fx / n1.mass) * dt; n1.vy += (fy / n1.mass) * dt; }
if (!n2.pinned) { n2.vx -= (fx / n2.mass) * dt; n2.vy -= (fy / n2.mass) * dt; }`,
      },
      {
        type: 'heading',
        text: 'Ergonomic Interaction & Bézier Splines',
      },
      {
        type: 'text',
        text: (
          <>
            When dragging any point along the chain, the mouse coordinates override the target node’s velocity while propagating tension to its neighbors. The rendered spine uses quadratic Bézier midpoint interpolation for silk-smooth curvature.
          </>
        ),
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
        text: 'Morphogenesis & The Gray-Scott Kinetic System',
      },
      {
        type: 'text',
        text: (
          <>
            In 1952, Alan Turing proposed that patterns found in nature—such as zebra stripes, cheetah spots, and coral labyrinths—can arise spontaneously through the reaction and differential diffusion of two morphogen chemicals.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'Partial Differential Equations',
      },
      {
        type: 'text',
        text: (
          <>
            The concentration fields U and V evolve according to coupled non-linear reaction-diffusion equations discretized over a 2D discrete grid:
            <br />
            • ∂U/∂t = Du · ∇²U - U·V² + F·(1 - U)
            <br />
            • ∂V/∂t = Dv · ∇²V + U·V² - (F + k)·V
          </>
        ),
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Discrete Laplacian convolution & Gray-Scott reaction
const lapU = (u[i - 1] + u[i + 1] + u[i - GW] + u[i + GW] - 4 * curU) * 0.2;
const lapV = (v[i - 1] + v[i + 1] + v[i - GW] + v[i + GW] - 4 * curV) * 0.2;
const uvv = curU * curV * curV;

// Feed rate F = 0.0545, kill rate K = 0.062
nextU[i] = curU + (Du * lapU - uvv + F * (1.0 - curU));
nextV[i] = curV + (Dv * lapV + uvv - (F + K) * curV);`,
      },
      {
        type: 'heading',
        text: 'Interactive Seeding & Direct Buffer Blitting',
      },
      {
        type: 'text',
        text: (
          <>
            Swiping across the stage injects high concentrations of chemical V into the U-dominated matrix. The system computes double simulation steps per animation frame on TypedArrays and blits directly to canvas through an ImageData buffer.
          </>
        ),
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
        text: 'Deterministic Chaos & Phase Space Divergence',
      },
      {
        type: 'text',
        text: (
          <>
            A double pendulum consists of two rigid links connected in series. Despite having only two degrees of freedom and zero stochastic noise, the coupled nonlinear equations render long-term analytical prediction impossible—the quintessential hallmark of deterministic chaos.
          </>
        ),
      },
      {
        type: 'heading',
        text: 'Lagrangian Formulation of Motion',
      },
      {
        type: 'text',
        text: (
          <>
            The equations of motion are derived using Lagrange’s equations d/dt (∂L/∂θ̇) - ∂L/∂θ = 0, resolving the angular accelerations α₁ and α₂:
          </>
        ),
      },
      {
        type: 'code',
        lang: 'JavaScript',
        code: `// Coupled Lagrangian equations for double pendulum
const dth = th1 - th2;
const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));

const num1 = -g * (2 * m1 + m2) * Math.sin(th1) 
  - m2 * g * Math.sin(th1 - 2 * th2) 
  - 2 * Math.sin(dth) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(dth));

const num2 = 2 * Math.sin(dth) * (w1 * w1 * l1 * (m1 + m2) 
  + g * (m1 + m2) * Math.cos(th1) 
  + w2 * w2 * l2 * m2 * Math.cos(dth));

w1 += (num1 / den1) * dt * 0.45;
w2 += (num2 / den2) * dt * 0.45;`,
      },
      {
        type: 'heading',
        text: 'Visualizing Strange Attractors',
      },
      {
        type: 'text',
        text: (
          <>
            The secondary bob’s spatial locus paints a glowing trajectory that fades over time. Notice how small angular perturbations from the cursor produce completely divergent geometric attractor orbits.
          </>
        ),
      },
    ],
    stack: ['JavaScript', 'Lagrangian Dynamics', 'Canvas 2D'],
  },
];
