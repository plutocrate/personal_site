/**
 * Underline (HandDrawnUnderline) Component
 * 
 * Renders text with an organic, hand-drawn vector squiggly underline.
 * Supports multiple contrasting colors in lighter/balanced tones that don't overwhelm text.
 * 
 * Available colors:
 * - 'blue'    : Apple signature / cyan blue
 * - 'green'   : Emerald / mint green
 * - 'orange'  : Warm amber / terracotta
 * - 'rose'    : Soft rose / coral
 * - 'purple'  : Vibrant lavender / violet
 * - 'teal'    : Soft ocean teal
 * - 'default' : Apple blue (--accent-blue)
 * 
 * Variants:
 * - 'default'   : Balanced natural hand-drawn wave
 * - 'developer' : Organic 3-wave wobble
 * - 'designer'  : Fluid extended wave
 * - 'linux'     : Compact punchy scribble
 * - 'long'      : Broad stroke for phrases
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

export default function Underline({ children, variant = 'default', color = 'default', className = '' }) {
  const config = SQUIGGLE_VARIANTS[variant] || SQUIGGLE_VARIANTS.default;

  return (
    <span className={`hand-drawn-wrap ${className}`}>
      {children}
      <svg
        className={`hand-drawn-squiggle un-${color}`}
        viewBox={config.viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={config.path}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
