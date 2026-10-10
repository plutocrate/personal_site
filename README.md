# Personal Portfolio & Concept Playground

A clean, canvas-style personal portfolio with a daily quote engine, life update feed, live concept simulations, and interactive design explorations.

Built with **React**, **Vite**, **Framer Motion**, and **React Router**.

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

- **Interactive Magic Logo**: Tapping or clicking the logo in the sidebar rolls a fresh quote, plays a playful wobble/glow microinteraction, and bursts falling magical star particles.
- **Quote Engine**: Daily random quote from a curated pool of art, existentialism, absurdism, and science. The author name is always pinned to the bottom of the card. Double-click anywhere or click the logo to cycle.
- **Smooth Sidebar Controls**: Drag to pull/collapse, toggle with the pill button, or press the `[` shortcut key.
- **Dynamic Navigation Subtext**: Superscript counts automatically update for Concept Playground, Case Studies, Journal, and Contact items.
- **Rich Life Updates Reel**: Clean, borderless media showcase with embedded YouTube player / local image carousel and centered descriptions.
- **Live Concept Playground**: Physics simulations (boids flocking, gravity well) running in Canvas 2D / WebAssembly.
- **Text Styling Toolkit**: Modular, customizable pastel Highlights and hand-drawn organic squiggly Underlines designed with high-contrast, non-obtrusive readability.

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

## 📁 CMS Content Management Guide

All portfolio data is separated into clean, modular CMS files under `src/data/`:

### 1. `src/data/content.js`
Houses global website profile data, navigation, case studies, journal articles, and contact links:

- **Profile**:
  ```js
  export const profile = {
    name: 'Your Name',
    role: 'Developer & UI/UX Designer',
    year: new Date().getFullYear(),
  };
  ```

- **Case Studies (`src/data/content.jsx`)**:
  Currently empty with blueprint templates commented inside. When empty, visitors see a cool **"nothing here....YET"** empty state with the **Flappy Square** mini-game.
  
  To add your own case study, add an object to the `caseStudies` array in `src/data/content.jsx`:
  ```jsx
  {
    id: 'my-project-slug',     // URL: /case-studies/my-project-slug
    title: 'Project Title',
    meta: 'Personal · 2024',
    status: 'shipped',         // 'shipped' (green) | 'building' (blue) | 'draft' (gray)
    hue: 150,                  // Dynamic background gradient hue (0-360)
    stack: ['React', 'TypeScript', 'Tailwind'],
    blocks: mk(
      <>First paragraph with optional <Highlight color="yellow">highlights</Highlight>.</>,
      <>Second paragraph with <Underline color="blue" variant="default">underlines</Underline>.</>,
      <>Closing thoughts and conclusions.</>
    ),
  }
  ```

- **Journal (`src/data/content.jsx`)**:
  Currently empty with blueprint templates commented inside. When empty, visitors also see the cool **"nothing here....YET"** empty state with **Flappy Square**.
  
  To add a new essay or writing piece, add an object to the `journal` array in `src/data/content.jsx`:
  ```jsx
  {
    id: 'my-essay-slug',       // URL: /journal/my-essay-slug
    title: 'Your Article Title',
    meta: 'Essay · Aug 2024',
    date: '2024-08-07',        // YYYY-MM-DD
    hue: 215,                  // Ambient ray hue angle (0-360)
    stack: ['Design', 'Philosophy', 'Frontend'],
    blocks: mk(
      <>Opening ideas with <Highlight color="rose">visual styling</Highlight>.</>,
      <>Deep-dive architectural reflection.</>,
      <>Summary conclusion.</>
    ),
  }
  ```

- **Contact Links**:
  ```js
  export const contacts = [
    { label: 'LinkedIn', href: 'https://linkedin.com/in/prathammpurohit' },
    { label: 'GitHub', href: 'https://github.com/plutocrate' },
    { label: 'Mail', href: 'mailto:prathampurohitonline@outlook.com' },
  ];
  ```

---

### 2. `src/data/lifeUpdates.jsx`
Manages the Life Updates reel and the featured update on the About page. Automatically sorts by newest date first:

- **YouTube Video Update**:
  ```jsx
  {
    id: 'bhalo-lage',
    date: '2024-08-07',
    media: {
      type: 'youtube',
      id: '-oq0Kr40f2M', // YouTube video ID from URL
    },
    text: (
      <>
        I would like to recommend you a song today. It’s{' '}
        <Highlight color="yellow">“Bhalo lage”</Highlight> a{' '}
        <Underline color="blue" variant="default">bengali</Underline> song by the 70’s band{' '}
        <Highlight color="green">Mohineer Ghoraguli</Highlight>.
      </>
    ),
  }
  ```

- **Image Update**:
  ```jsx
  {
    id: 'trip-to-mountains',
    date: '2024-09-10',
    media: {
      type: 'image',
      src: '/life/my-photo.jpg', // Place in public/life/
    },
    text: (
      <>
        Weekend hike through the northern trails with{' '}
        <Highlight color="blue">misty mornings</Highlight>.
      </>
    ),
  }
  ```

---

### 3. `src/data/quotes.js`
Daily quote pool for the sidebar quote box:

```js
export const quotes = [
  { text: 'One must imagine Sisyphus happy.', author: 'Albert Camus' },
  { text: 'Your favorite quote here.', author: 'Author Name' },
];
```

---

## 🛠️ Simulation Playground (`src/playground/`)

To add a new live simulation in the Concept Playground:
1. Create a script in `src/playground/mySimulation.js` exporting a `start(canvas) => stop` function.
2. Register the simulation in `src/playground/index.js` with its title, hue, and tech stack tags.

---

## 🔤 Typography

The site defaults to Apple's **SF Pro** system font stack. You can optionally drop a licensed `SF-Pro.woff2` into `/public/fonts/` for cross-platform local rendering.
