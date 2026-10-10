import { mk } from './blocks.js';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

/* ==========================================================================
   PORTFOLIO CMS / DATA CONFIGURATION
   --------------------------------------------------------------------------
   This file acts as your central content management store.
   You can easily update your profile, bio, navigation, case studies, journal
   articles, and contact links here without touching page code.
   ========================================================================== */

/**
 * --------------------------------------------------------------------------
 * 1. PROFILE & IDENTITY
 * --------------------------------------------------------------------------
 * Your basic info shown across the website header and footer.
 */
export const profile = {
  name: 'Pratham Purohit',
  role: 'Developer & UI/UX Designer',
  year: new Date().getFullYear(),
};

/**
 * --------------------------------------------------------------------------
 * 2. NAVIGATION
 * --------------------------------------------------------------------------
 * Main sidebar navigation links.
 * - `to`: Route path (e.g., '/', '/case-studies', '/journal')
 * - `label`: Display text
 * - `end`: Set `true` for exact route matching on homepage
 */
export const nav = [
  { to: '/', label: 'About', end: true },
  { to: '/playground', label: 'Concept Playground' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/journal', label: 'Journal' },
  { to: '/life', label: 'Life updates' },
];

/**
 * --------------------------------------------------------------------------
 * 3. CASE STUDIES
 * --------------------------------------------------------------------------
 * Showcase your key design and engineering projects.
 *
 * BLUEPRINT TEMPLATE:
 * To add a new case study, add an object to the `caseStudies` array below:
 * ```js
 * {
 *   id: 'unique-slug',
 *   title: 'Project Title',
 *   meta: 'Personal · 2024',
 *   status: 'shipped', // 'shipped' (green) | 'building' (blue) | 'draft' (gray)
 *   hue: 210, // Accent hue angle for header card
 *   stack: ['React', 'TypeScript', 'Node.js'],
 *   blocks: mk(
 *     <>First paragraph with <Highlight color="yellow">highlighted text</Highlight>.</>,
 *     <>Second paragraph with <Underline color="blue" variant="default">underlined text</Underline>.</>,
 *     <>Third paragraph concluding the writeup.</>
 *   ),
 * }
 * ```
 */
export const caseStudies = [
  /*
  {
    id: 'pencil-box',
    title: 'Pencil Box',
    meta: 'Personal · 2024',
    status: 'draft',
    hue: 210,
    blocks: mk(
      <>
        A drawing-first tool for <Highlight color="yellow">sketching with constraints</Highlight>. The case study covers the custom brush engine, why the canvas has <Underline color="blue" variant="default">no undo stack</Underline>, and how the tool stays out of the creator’s way.
      </>,
      <>
        The problem was less about adding complex features and more about feel. Early prototypes worked, but every extra UI panel asked the user to think about the tool instead of the sketch.
      </>,
      <>
        The final version removes steps instead of adding them. Each constraint was tested by using it daily for weeks and cutting whatever distracted from immediate drawing.
      </>
    ),
    stack: ['React', 'Canvas', 'Zustand'],
  },
  {
    id: 'renaissance',
    title: 'Renaissance',
    meta: 'Personal · 2024',
    status: 'building',
    hue: 25,
    blocks: mk(
      <>
        An exploration of <Highlight color="orange">classical composition</Highlight> in the browser: golden ratios, harmonic grids, and how centuries-old rules of balance translate into <Underline color="purple" variant="designer">modern interface layout</Underline>.
      </>,
      <>
        We studied Renaissance proportions and mapped them into procedural CSS grids and WebGL shaders to see how organic geometric harmony affects visual hierarchy.
      </>,
      <>
        The result is a dynamic layout engine that automatically aligns typography and spatial elements according to classical golden spiral ratios.
      </>
    ),
    stack: ['Three.js', 'GLSL', 'Vite'],
  },
  {
    id: 'portfolio',
    title: 'Portfolio Website',
    meta: 'Personal · 2024',
    status: 'shipped',
    hue: 150,
    blocks: mk(
      <>
        This site. A calm, canvas-like space with a <Highlight color="green">daily quote engine</Highlight>, a live life update feed, and an interactive playground of <Underline color="blue" variant="long">real-time simulations</Underline>.
      </>,
      <>
        Designed with careful attention to tactile microinteractions, gesture-driven sidebar drawers, and seamless transitions using Framer Motion.
      </>,
      <>
        Built to be a living, evolving personal home on the web with a fully modular CMS data structure.
      </>
    ),
    stack: ['React', 'Framer Motion', 'Vite'],
  },
  {
    id: 'frag-buddha',
    title: 'Frag Buddha',
    meta: 'Personal · 2023',
    status: 'shipped',
    hue: 280,
    blocks: mk(
      <>
        Fragments of calm, one quote at a time. A small experiment in making a quote generator <Highlight color="rose">feel like a tranquil place</Highlight> instead of a standard digital widget.
      </>,
      <>
        Minimalist typography paired with ambient generative soundscapes and soft atmospheric transitions.
      </>,
      <>
        Designed for moments of pause and reflection throughout a busy workday.
      </>
    ),
    stack: ['JavaScript', 'Firebase', 'CSS'],
  },
  {
    id: 'dotfiles',
    title: 'Dotfiles Manager',
    meta: 'Personal · 2023',
    status: 'draft',
    hue: 340,
    blocks: mk(
      <>
        A command-line tool for keeping a <Underline color="teal" variant="linux">Linux setup reproducible</Underline> across machines, with a small <Highlight color="blue">TUI for browsing changes</Highlight>.
      </>,
      <>
        Automates symlinking, package tracking, and secret management across multiple workstation environments.
      </>,
      <>
        Features a keyboard-driven terminal interface written in Rust for fast visual diffing and rollback.
      </>
    ),
    stack: ['Rust', 'Linux', 'TUI'],
  },
  */
];

/**
 * --------------------------------------------------------------------------
 * 4. JOURNAL / ESSAYS
 * --------------------------------------------------------------------------
 * Long-form writings, architectural reflections, and design notes.
 *
 * BLUEPRINT TEMPLATE:
 * To add a new journal entry, add an object to the `journal` array below:
 * ```js
 * {
 *   id: 'essay-slug',
 *   title: 'Essay Title',
 *   meta: 'Essay · Aug 2024',
 *   date: '2024-08-07', // YYYY-MM-DD
 *   hue: 215, // Accent hue angle for ambient rays
 *   stack: ['Design', 'Philosophy', 'Frontend'],
 *   blocks: mk(
 *     <>First paragraph with <Highlight color="yellow">highlighted thoughts</Highlight>.</>,
 *     <>Second paragraph with <Underline color="blue" variant="default">underlined ideas</Underline>.</>,
 *     <>Third paragraph conclusion.</>
 *   ),
 * }
 * ```
 */
export const journal = [
  /*
  {
    id: 'rebuilding-portfolio',
    title: 'Why I keep rebuilding my portfolio',
    meta: 'Essay · Aug 2024',
    date: '2024-08-07',
    hue: 215,
    stack: ['Design', 'Philosophy', 'Frontend'],
    blocks: mk(
      <>
        Notes on treating a personal site as a <Highlight color="yellow">living, evolving garden</Highlight> rather than a static resume artifact.
      </>,
      <>
        Every redesign is not just a cosmetic repaint, but a distillation of <Underline color="blue" variant="default">how my thinking has matured</Underline> about software and craft.
      </>,
      <>
        The canvas approach allows code experiments, physics playgrounds, and daily philosophy to coexist in <Highlight color="green">one continuous space</Highlight>.
      </>
    ),
  },
  {
    id: 'tactile-interfaces',
    title: 'The art of tactile web interfaces',
    meta: 'Design · Jul 2024',
    date: '2024-07-18',
    hue: 275,
    stack: ['UI/UX', 'Motion', 'Haptics'],
    blocks: mk(
      <>
        How microinteractions, spring physics, and organic gestures turn <Highlight color="purple">flat browser pixels</Highlight> into tangible objects.
      </>,
      <>
        When drag elasticity feels natural and damping matches real-world inertia, digital tools <Underline color="orange" variant="long">feel instantly responsive</Underline> to human touch.
      </>,
      <>
        Thoughtful interactive feedback communicates system state without requiring explicit instructional labels.
      </>
    ),
  },
  {
    id: 'linux-under-the-hood',
    title: 'Learning Linux under the hood',
    meta: 'Systems · Jun 2024',
    date: '2024-06-22',
    hue: 145,
    stack: ['Linux', 'Kernel', 'Terminal'],
    blocks: mk(
      <>
        Why peeling back the layers of <Underline color="teal" variant="linux">operating system internals</Underline> fundamentally makes you a better software designer.
      </>,
      <>
        Understanding POSIX pipelines, process signals, and memory mapped buffers demystifies what web runtimes do <Highlight color="blue">behind high-level abstractions</Highlight>.
      </>,
      <>
        The elegance of the Unix philosophy remains the most durable blueprint for building modular systems.
      </>
    ),
  },
  {
    id: 'calm-technology',
    title: 'Calm technology and deliberate friction',
    meta: 'Thoughts · May 2024',
    date: '2024-05-30',
    hue: 35,
    stack: ['Philosophy', 'Product', 'Minimalism'],
    blocks: mk(
      <>
        Why modern software needs fewer notifications and more <Highlight color="rose">unhurried, quiet moments</Highlight>.
      </>,
      <>
        Deliberate friction helps users pause and reflect, creating tools that respect attention rather than <Underline color="purple" variant="designer">optimizing for addiction</Underline>.
      </>,
      <>
        Designing for calm requires resisting the urge to fill every blank viewport with metrics and alerts.
      </>
    ),
  },
  {
    id: 'crafting-microinteractions',
    title: 'Crafting unnoticeable details',
    meta: 'Engineering · Apr 2024',
    date: '2024-04-12',
    hue: 325,
    stack: ['Framer Motion', 'React', 'CSS'],
    blocks: mk(
      <>
        The tiny details that users rarely mention by name, but instantly miss when they are gone.
      </>,
      <>
        From non-scaling vector underlines to smooth particle bursts, <Highlight color="orange">good design is felt</Highlight> before it is consciously analyzed.
      </>,
      <>
        Building delightful microinteractions is about harmonizing animation timing curves with ergonomic user expectations.
      </>
    ),
  },
  */
];

/**
 * --------------------------------------------------------------------------
 * 5. CONTACT & SOCIAL LINKS
 * --------------------------------------------------------------------------
 * Displayed in the sidebar contact drawer.
 */
export const contacts = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/prathammpurohit' },
  { label: 'GitHub', href: 'https://github.com/plutocrate' },
  { label: 'Mail', href: 'mailto:prathampurohitonline@outlook.com' },
];
