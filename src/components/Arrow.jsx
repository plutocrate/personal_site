// Real SVG arrows (no text glyphs). dir: 'up-right' | 'left'
export default function Arrow({ dir = 'up-right', size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <path d="M10 6H2.5M5.5 2.8L2.3 6l3.2 3.2" /> : <path d="M3 9l6-6M4 3h5v5" />}
    </svg>
  );
}
