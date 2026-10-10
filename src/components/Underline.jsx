/**
 * Underline (HandDrawnUnderline) Component
 * 
 * Renders text with an organic, hand-drawn vector squiggly underline.
 * Colors are chosen procedurally across 8 distinct color slots.
 * Contrast is high in the About bio and gentle/lower elsewhere.
 */

const SQUIGGLE_VARIANTS = {
  developer: {
    viewBox: '0 0 100 12',
    path: 'M 3 7 C 14 2.5, 24 11.5, 39 6.5 C 54 2, 67 11, 81 5.5 C 89 2.8, 94 9, 98 6',
  },
  designer: {
    viewBox: '0 0 160 12',
    path: 'M 3 6.5 C 16 2, 27 11.5, 42 6 C 57 1.5, 69 11, 84 5.5 C 99 1.8, 111 11, 126 5 C 139 1.5, 149 10, 158 6',
  },
  linux: {
    viewBox: '0 0 60 12',
    path: 'M 3 6.5 C 11 2, 19 11.5, 30 5.5 C 41 1.5, 49 10.5, 58 6',
  },
  long: {
    viewBox: '0 0 200 12',
    path: 'M 3 6.5 C 20 2, 35 11, 55 5.5 C 75 2, 92 11, 112 5.5 C 132 1.5, 148 11, 168 5 C 182 1.5, 191 9.5, 198 6',
  },
  default: {
    viewBox: '0 0 100 12',
    path: 'M 3 6.5 C 15 2.5, 26 11, 40 6 C 55 2, 68 10.5, 82 5.5 C 90 3, 94 8.5, 98 6',
  }
};

const COLOR_TO_SLOT = {
  yellow: 1,
  gold: 1,
  green: 2,
  lime: 2,
  teal: 3,
  mint: 3,
  cyan: 4,
  blue: 5,
  purple: 6,
  violet: 6,
  rose: 7,
  pink: 7,
  orange: 8,
  amber: 8,
  peach: 8,
};

function hashString(str) {
  if (!str) return 5;
  const s = typeof str === 'string' ? str : String(str);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Underline({ children, variant = 'default', color, className = '' }) {
  const config = SQUIGGLE_VARIANTS[variant] || SQUIGGLE_VARIANTS.default;
  let slot = color ? (COLOR_TO_SLOT[color] || parseInt(color, 10) || null) : null;
  if (!slot || slot < 1 || slot > 8) {
    slot = (hashString(children) % 8) + 1;
  }

  return (
    <span className={`hand-drawn-wrap ${className}`}>
      {children}
      <svg
        className={`hand-drawn-squiggle un-${slot}`}
        viewBox={config.viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={config.path}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
