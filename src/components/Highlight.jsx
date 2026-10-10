/**
 * Highlight Component
 * 
 * Renders text with an algorithmic pastel highlighter marker effect.
 * Colors are chosen procedurally based on the current canvas theme.
 * Contrast is high on the About page and gentle/lower elsewhere.
 */

const COLOR_TO_SLOT = {
  yellow: 1,
  gold: 1,
  green: 2,
  mint: 2,
  teal: 3,
  cyan: 3,
  blue: 4,
  purple: 5,
  violet: 5,
  rose: 6,
  pink: 6,
  orange: 6,
  peach: 6,
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
  if (!slot || slot < 1 || slot > 6) {
    slot = (hashString(children) % 6) + 1;
  }

  return (
    <mark className={`hl hl-${slot} ${className}`}>
      {children}
    </mark>
  );
}
