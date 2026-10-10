/**
 * Highlight Component
 * 
 * Renders text with a soft, pastel highlighter marker effect.
 * Designed with lighter, subtle tones so it provides great visual emphasis
 * without colliding with the readability of main content.
 * 
 * Available colors:
 * - 'yellow'  : Warm pastel yellow
 * - 'green'   : Soft pastel mint / lime
 * - 'blue'    : Airy pastel sky blue
 * - 'orange'  : Soft peach / amber
 * - 'rose'    : Gentle pastel rose / pink
 * - 'purple'  : Soft lavender
 * - 'default' : Site accent neon-lime marker
 */
export default function Highlight({ children, color = 'default', className = '' }) {
  return (
    <mark className={`hl hl-${color} ${className}`}>
      {children}
    </mark>
  );
}
