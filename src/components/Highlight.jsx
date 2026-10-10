/**
 * Highlight Component
 * 
 * Renders text with an algorithmic pastel highlighter marker effect.
 * Colors are chosen procedurally across 8 distinct color slots.
 * Contrast is high in the About bio and gentle/lower elsewhere.
 */

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
  if (!str) return 1;
  const s = typeof str === 'string' ? str : String(str);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Highlight({ children, color, className = '' }) {
  let slot = color ? (COLOR_TO_SLOT[color] || parseInt(color, 10) || null) : null;
  if (!slot || slot < 1 || slot > 8) {
    slot = (hashString(children) % 8) + 1;
  }

  return (
    <mark className={`hl hl-${slot} ${className}`}>
      {children}
    </mark>
  );
}
