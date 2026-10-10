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
    blocks: mk(
      <>
        A hundred boids following three emergent rules:{' '}
        <Highlight color="yellow">stay apart</Highlight>,{' '}
        <Highlight color="green">match heading</Highlight>, and{' '}
        <Highlight color="blue">drift toward the group</Highlight>.
      </>,
      <>
        Each boid looks at neighbours within a short radius. Too close and it steers away, otherwise it nudges its heading toward the group. <Underline color="purple" variant="default">No boid knows the shape of the flock</Underline>.
      </>,
      <>
        The pointer adds one more rule: flee. Because everything runs through the same steering code, the scatter looks like <Highlight color="orange">one continuous gesture</Highlight> instead of an artificial effect.
      </>
    ),
    stack: ['JavaScript', 'Canvas 2D'],
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
    blocks: mk(
      <>
        Particles orbiting a <Highlight color="purple">well of gravity</Highlight> that smoothly tracks your cursor across the canvas.
      </>,
      <>
        Each particle feels a pull toward the well that grows as it gets closer, <Underline color="green" variant="default">softened near the centre</Underline> so nothing is flung away at infinite speed.
      </>,
      <>
        Instead of clearing the canvas every frame, old frames fade slowly. <Highlight color="rose">The trails are the picture</Highlight>: they map the emergent gravitational orbits created by physics.
      </>
    ),
    stack: ['JavaScript', 'Canvas 2D'],
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
    blocks: mk(
      <>
        A linked chain of point masses responding to spring forces, gravity, and <Highlight color="yellow">elastic deformation</Highlight>.
      </>,
      <>
        Hover or drag any node along the chain to deflect it. Hooke’s law calculates restore forces between neighbors, while <Underline color="blue" variant="default">quadratic Bézier interpolation</Underline> keeps the chain visually continuous.
      </>,
      <>
        Velocity damping prevents erratic oscillation, letting the system settle smoothly back to equilibrium after disturbance.
      </>
    ),
    stack: ['JavaScript', 'Canvas 2D', 'Verlet'],
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
    blocks: mk(
      <>
        The Gray-Scott reaction-diffusion system simulated in real-time, modeling how biological <Underline color="teal" variant="default">Turing patterns</Underline> emerge from chemical kinetics.
      </>,
      <>
        Two virtual chemicals diffuse across a grid at different rates. Chemical U is continuously fed while chemical V is consumed, forming self-organizing spirals and leopard spots.
      </>,
      <>
        Dragging your pointer introduces high concentrations of catalyst, creating <Highlight color="green">novel morphogenesis fronts</Highlight> that ripple across the surface.
      </>
    ),
    stack: ['JavaScript', 'Grid Simulation', 'Canvas 2D'],
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
    blocks: mk(
      <>
        A classic double pendulum demonstrating <Highlight color="rose">deterministic chaos</Highlight> governed by coupled non-linear differential equations.
      </>,
      <>
        Small changes in initial conditions produce drastically diverging trajectories. Even without random numbers, motion is <Underline color="rose" variant="default">inherently unpredictable</Underline>.
      </>,
      <>
        Move your pointer near the apex to impart angular momentum and watch the glowing trail paint the chaotic attractor.
      </>
    ),
    stack: ['JavaScript', 'Lagrangian Physics', 'Canvas 2D'],
  },
];
