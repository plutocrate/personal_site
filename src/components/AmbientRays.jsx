import { useMemo } from 'react';

/**
 * AmbientRays Component
 * 
 * Renders dynamically generated, ultra-mild ambient color light rays
 * radiating downward from the top of the container—inspired by the subtle,
 * premium atmospheric lighting used by Apple, Vercel, Meta, and Google Gemini.
 */
export default function AmbientRays({ seed, className = '' }) {
  // Generate harmonious mild pastel ray hues dynamically
  const { hue1, hue2, hue3, angle1, angle2 } = useMemo(() => {
    // Generate deterministic or randomized dynamic hues
    const baseHue = typeof seed === 'number'
      ? seed
      : (seed ? String(seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : Math.floor(Math.random() * 360));
    
    return {
      hue1: baseHue % 360,
      hue2: (baseHue + 42) % 360,
      hue3: (baseHue + 280) % 360,
      angle1: 25 + (baseHue % 30),
      angle2: 65 + (baseHue % 25),
    };
  }, [seed]);

  return (
    <div className={`ambient-rays ${className}`} aria-hidden="true">
      {/* Central primary ray beam */}
      <div
        className="ray-beam ray-primary"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -15%, hsla(${hue1}, 75%, 68%, 0.18) 0%, hsla(${hue1}, 70%, 65%, 0.06) 45%, transparent 75%)`,
        }}
      />
      {/* Left-leaning secondary light cone */}
      <div
        className="ray-beam ray-secondary"
        style={{
          background: `radial-gradient(ellipse 65% 50% at ${angle1}% -10%, hsla(${hue2}, 80%, 72%, 0.15) 0%, transparent 65%)`,
        }}
      />
      {/* Right-leaning tertiary highlight ray */}
      <div
        className="ray-beam ray-tertiary"
        style={{
          background: `radial-gradient(ellipse 65% 50% at ${angle2}% -10%, hsla(${hue3}, 80%, 70%, 0.13) 0%, transparent 65%)`,
        }}
      />
      {/* Soft downward light dispersion sheen */}
      <div className="ray-sheen" />
    </div>
  );
}
