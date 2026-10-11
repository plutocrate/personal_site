# Personal Portfolio & Concept Playground

A minimalist, canvas-style personal portfolio and digital craft laboratory featuring real-time physics simulations, WebAssembly 3D rendering, a daily quote engine, a rich multimedia life feed, and an interactive geometry arcade.

Built with **React 18**, **Vite**, **Framer Motion**, and **React Router 6**. Hosted at [**prathamis.cool**](https://prathamis.cool).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## ✨ Salient Features

- **Interactive Magic Logo & Quote Toast**:
  - Tapping the logo rolls a fresh quote, dynamically shifts theme accent colors, and triggers an explosive burst of gravity-falling star particles.
  - When the sidebar is in its **compact/closed state**, clicking the logo also triggers a smooth **top toast notification** displaying the fresh quote and author.
- **Instant Route Scroll Reset**:
  - Seamless navigation between pages (`/flappy-square`, `/playground/:id/read`, `/about`, etc.) automatically scrolls the viewport and content container back to the top (`0, 0`).
- **Global Minimal Footer & Archive Directory**:
  - Included globally across the site without requiring manual imports on individual pages.
  - Features quick-access sitemap links, past portfolio archives ([3D Portfolio](https://plutocrate.github.io/3dportfolio/) and [v1 Portfolio](https://plutocrate.github.io/portfolio/)), live canonical domain ping (`prathamis.cool`), and direct links to deep-dive `/read` articles for concept playground simulations.
- **Flappy Square (Mini-Game & Standalone Route)**:
  - Responsive pure-geometry arcade game available both as a fallback on empty collection states and as a dedicated page at `/flappy-square`.
  - Dynamically scales obstacle spacing, pipe widths, and vertical passage gaps based on real-time screen width across mobile phones, tablets, and desktop displays.
- **Deep Concept Playground & 3D WebAssembly**:
  - Interactive canvas physics simulations including **Boids flocking**, **softened Gravity Well**, **Hookean Spring Chain**, **Conway’s Game of Life**, and **chaotic Double Pendulum**.
  - **Utah Teapot (WASM + C)**: Custom 3D wireframe and shaded mesh rendering engine compiled with Clang/WASM, complete with body color gap fills and orbital drag controls.
  - Detailed `/read` technical writeups for every simulation featuring mathematical formulations, excerpts, and complete production source code.
- **Persistent Embedded Media Reels**:
  - Life updates support Instagram Reels, CodePen previews, YouTube videos, local MP4s, Pinterest pins, and images.
  - Features background origin preconnection, speculative media prefetching, and a persistent DOM frame cache that retains iframe players across slide transitions without stutter or reload.
- **Fluid Gestures & Responsive Controls**:
  - Drag sideways to pull or collapse the sidebar, toggle via the pill slider, or press the `[` key.
  - Touch-friendly topic scrubbers and Apple-style mobile drawer headers.
- **Text Styling Toolkit**:
  - High-contrast, non-obtrusive pastel Highlights (`<Highlight>`) and hand-drawn organic squiggly Underlines (`<Underline>`).

---

## 🎨 Highlighter & Underline Color Palette Guide

You can use the `<Highlight>` and `<Underline>` components anywhere in your pages or CMS text.

### 1. Highlights (`<Highlight color="...">`)
Lighter, delicate pastel tones designed to emphasize text without overpowering content:

| Color Code | Prop Value | Appearance / Tone | Usage Example |
| :--- | :--- | :--- | :--- |
| **Yellow** | `color="yellow"` | Warm subtle pastel yellow | `<Highlight color="yellow">“Bhalo lage”</Highlight>` |
| **Green** | `color="green"` | Soft mint / pastel lime | `<Highlight color="green">Mohineer Ghoraguli</Highlight>` |
| **Blue** | `color="blue"` | Airy sky blue | `<Highlight color="blue">web development</Highlight>` |
| **Orange** | `color="orange"` | Soft peach / apricot | `<Highlight color="orange">Featured project</Highlight>` |
| **Rose** | `color="rose"` | Gentle pastel rose / pink | `<Highlight color="rose">Special release</Highlight>` |
| **Purple** | `color="purple"` | Light lavender | `<Highlight color="purple">Exploration</Highlight>` |
| **Default** | `color="default"` | Neon-lime marker accent | `<Highlight>Accent text</Highlight>` |

```jsx
import Highlight from '../components/Highlight.jsx';

<p>
  Check out our new <Highlight color="yellow">song recommendation</Highlight> today.
</p>
```

---

### 2. Underlines (`<Underline color="..." variant="...">`)
Authentic, hand-drawn vector squiggly underlines with non-scaling stroke geometry:

| Color Code | Prop Value | Appearance / Tone | Usage Example |
| :--- | :--- | :--- | :--- |
| **Blue** | `color="blue"` | Apple signature blue (`#0071e3`) | `<Underline color="blue">bengali</Underline>` |
| **Green** | `color="green"` | Emerald green (`#16a34a`) | `<Underline color="green">Open source</Underline>` |
| **Orange** | `color="orange"` | Warm terracotta (`#d97706`) | `<Underline color="orange">India’s first rock band</Underline>` |
| **Rose** | `color="rose"` | Crimson rose (`#e11d48`) | `<Underline color="rose">Design sprint</Underline>` |
| **Purple** | `color="purple"` | Violet lavender (`#7c3aed`) | `<Underline color="purple">Creative code</Underline>` |
| **Teal** | `color="teal"` | Ocean teal (`#0d9488`) | `<Underline color="teal">Experiments</Underline>` |
| **Default** | `color="default"` | Apple Blue (`--accent-blue`) | `<Underline>developer</Underline>` |

#### Underline Wave Variants (`variant="..."`):
- `variant="default"` : Balanced natural pen wave.
- `variant="developer"` : Organic 3-wave wobble.
- `variant="designer"` : Extended fluid hand curve.
- `variant="linux"` : Compact punchy scribble.
- `variant="long"` : Smooth wide wave for multi-word phrases.

```jsx
import Underline from '../components/Underline.jsx';

<p>
  Built with <Underline color="blue" variant="developer">React</Underline> and{' '}
  <Underline color="orange" variant="long">Framer Motion</Underline>.
</p>
```

---

## 📁 CMS Content Management Architecture

All portfolio data is decoupled from presentation logic into clean, modular CMS files located in `src/data/`:

### 1. Profile & Navigation (`src/data/content.jsx`)
Central identity, sidebar navigation, and social contact links:

```jsx
export const profile = {
  name: 'Pratham Purohit',
  role: 'Developer & UI/UX Designer',
  year: new Date().getFullYear(),
};

export const nav = [
  { to: '/', label: 'About', end: true },
  { to: '/playground', label: 'Concept Playground' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/journal', label: 'Essays' },
  { to: '/life', label: 'Life updates' },
];

export const contacts = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/prathammpurohit' },
  { label: 'GitHub', href: 'https://github.com/plutocrate' },
  { label: 'Mail', href: 'mailto:prathampurohitonline@outlook.com' },
];
```

---

### 2. Case Studies & Essays (`src/data/content.jsx`)
Showcase deep-dive technical projects and long-form writing. Each item powers both the horizontal reel preview (`/case-studies/:id` or `/journal/:id`) and the dedicated `/read` writeup page.

Items support modular article blocks:
- `{ type: 'heading', text: 'Section Title' }`
- `{ type: 'text', text: <p>Paragraph with <Highlight>highlights</Highlight></p> }`
- `{ type: 'code', lang: 'JavaScript', code: '...' }`
- `{ type: 'image', src: '/projects/preview.png' }` (or omit `src` for a tinted gradient fallback)

```jsx
import { mk } from './blocks.js';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

export const caseStudies = [
  {
    id: 'my-project-slug',     // URL: /case-studies/my-project-slug
    title: 'Project Title',
    meta: 'Personal · 2026',
    status: 'shipped',         // 'shipped' (green) | 'building' (blue) | 'draft' (gray)
    hue: 210,                  // Dynamic background gradient hue (0-360)
    stack: ['React', 'TypeScript', 'Tailwind'],
    blocks: [
      { type: 'heading', text: '1. Architecture & Goals' },
      {
        type: 'text',
        text: (
          <>
            Building an interactive tool with <Highlight color="yellow">zero undo stack latency</Highlight>.
          </>
        ),
      },
      {
        type: 'code',
        lang: 'TypeScript',
        code: `const engine = new Engine();\nengine.render();`,
      },
    ],
  },
];
```

> **Interactive Empty States**: If `caseStudies` or `journal` arrays are left empty (`[]`), the pages automatically display the custom **"nothing here....YET"** state containing the playable **Flappy Square** mini-game.

---

### 3. Life Updates Reel (`src/data/lifeUpdates.jsx`)
Powers the vertical swipe/scroll updates feed (`/life/:id`) and the featured update card on the About page. Items are automatically sorted by chronological timestamp (`date` + `time`) with the newest entry displayed first.

#### Supported Media Models:
- **Interactive Iframes (Instagram Reels, CodePen, Pinterest)**:
  Retained in a persistent DOM cache with speculative prefetching to eliminate iframe reload flicker:
  ```jsx
  {
    id: 'instagram-reel-update',
    date: '2026-10-10',
    time: '22:50:00',
    media: {
      type: 'iframe',
      src: 'https://www.instagram.com/reel/DeRrs6SO4bH/embed/',
      width: 400,
      height: 520,
      aspectRatio: '400 / 520',
      title: 'Instagram Reel - Meme',
    },
    text: (
      <TruncatedLifeText
        isLong={true}
        text={<>Checking the <Highlight color="yellow">media sizing</Highlight> and toast notification.</>}
        fullTextPlain="Testing everything, now time for reels! Checking dynamic media sizing and aspect ratios."
      />
    ),
  }
  ```
- **Local Videos**:
  ```jsx
  {
    id: 'guitar-practice-terebina',
    date: '2026-10-10',
    time: '23:15:00',
    media: {
      type: 'video',
      src: '/life/terebinag.mp4',
      width: 634,
      height: 356,
      aspectRatio: '634 / 356',
      title: 'Guitar Practice - Tere Bina',
    },
    text: (
      <>
        Late-night <Highlight color="green">guitar practice session</Highlight> playing{' '}
        <Underline color="blue" variant="default">“Tere Bina”</Underline>.
      </>
    ),
  }
  ```
- **YouTube Embeds**:
  ```jsx
  {
    id: 'music-recommendation',
    date: '2024-08-07',
    time: '14:20:00',
    media: {
      type: 'youtube',
      id: '-oq0Kr40f2M', // YouTube video ID from URL
    },
    text: <>Listening to vintage records.</>,
  }
  ```
- **Local or Remote Images**:
  ```jsx
  {
    id: 'mountain-hike',
    date: '2024-09-10',
    time: '10:00:00',
    media: {
      type: 'image',
      src: '/life/photo.jpg', // Placed inside /public/life/
    },
    text: <>Northern trails morning hike.</>,
  }
  ```

---

### 4. Quotes Data Pool (`src/data/quotes.js`)
Stores the curated pool of thoughts, philosophy, and art quotes loaded on visit:

```js
export const quotes = [
  { text: 'One must imagine Sisyphus happy.', author: 'Albert Camus' },
  { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
];
```

---

### 5. Concept Playground Labs (`src/playground/index.jsx`)
Interactive simulations that pair a real-time canvas animation with an in-depth `/read` technical writeup:

```jsx
{
  id: 'my-simulation',
  title: 'Simulation Title',
  hue: 210,
  start: startMySimulation, // Function: (canvas) => cleanupFunction
  description: <>Overview text with <Highlight color="blue">highlights</Highlight>.</>,
  blocks: [
    { type: 'heading', text: '1. Overview & Mechanics' },
    { type: 'text', text: <>Algorithmic breakdown.</> },
    { type: 'code', lang: 'JavaScript', code: '// Production simulation code' },
  ],
  stack: ['JavaScript', 'Canvas 2D', 'Kinematics'],
}
```

---

## 🔤 Typography & Assets

- The typography stack defaults to Apple’s **SF Pro** system font. You can drop a licensed `SF-Pro.woff2` into `/public/fonts/` for local cross-platform consistency.
- Media assets for life updates and articles live inside `/public/life/` and `/public/projects/`.

