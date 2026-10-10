import { startBoids } from './boids.js';
import { startGravity } from './gravity.js';
import { mk, SOON } from '../data/blocks.js';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

/* ==========================================================================
   CONCEPT PLAYGROUND CMS / DATA STORE
   --------------------------------------------------------------------------
   Register physics simulations and concept playgrounds here.
   - `start`: Animation starter function `start(canvas) => stop`
   - `start: null`: Automatically displays "Coming soon" state.
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
    meta: 'Coming soon',
    hue: 30,
    start: null,
    description: (
      <>
        A chain of masses joined by springs that you can pull and release, with the physics step computed in <Highlight color="yellow">WebAssembly</Highlight>.
      </>
    ),
    blocks: mk(
      'A chain of masses joined by springs that you can pull and release with real-time elasticity.',
      ...SOON
    ),
    stack: ['Rust', 'WebAssembly', 'Canvas 2D'],
  },
  {
    id: 'reaction-diffusion',
    title: 'Reaction diffusion',
    meta: 'Coming soon',
    hue: 150,
    start: null,
    description: (
      <>
        Two chemicals feeding and consuming each other, generating <Underline color="teal" variant="default">coral and spot patterns</Underline>. Computed on a grid in <Highlight color="green">WebAssembly</Highlight>.
      </>
    ),
    blocks: mk(
      'Two chemicals feeding and consuming each other, producing biological Turing patterns.',
      ...SOON
    ),
    stack: ['C', 'WebAssembly', 'WebGL'],
  },
  {
    id: 'double-pendulum',
    title: 'Double pendulum',
    meta: 'Coming soon',
    hue: 330,
    start: null,
    description: (
      <>
        A chaotic system you can nudge. Two almost identical starting angles <Underline color="rose" variant="default">drift apart within seconds</Underline>.
      </>
    ),
    blocks: mk(
      'A chaotic system you can nudge to observe deterministic chaos in real-time.',
      ...SOON
    ),
    stack: ['JavaScript', 'Canvas 2D'],
  },
];
