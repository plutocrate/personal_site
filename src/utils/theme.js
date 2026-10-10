/**
 * Dynamic subtle off-white canvas generator.
 * Algorithmically samples hues across the 360° color wheel
 * to generate ultra-subtle whites / off-whites with gentle tints.
 * Also dynamically computes 8 harmonized highlight and underline colors
 * with high contrast for the bio and lower contrast elsewhere.
 * No hardcoded color array — completely procedural math.
 */

let currentHue = Math.floor(Math.random() * 360);

export function getRandomSubtleTheme() {
  // Jump between 60° and 300° to guarantee noticeable, delightful variation across the color wheel
  const jump = 60 + Math.random() * 240;
  currentHue = Math.round((currentHue + jump) % 360);

  // Subtle, soft saturation (22% - 30%) - reduced slightly so it is easy on the eyes while surely visible
  const sat = 22 + Math.random() * 8;
  // Comfortable lightness (94.6% - 96.0%)
  const light = 94.6 + Math.random() * 1.4;

  // Secondary harmonic hue for dynamic subtle gradient (shifted 30° to 75°)
  const hue2 = Math.round((currentHue + 35 + Math.random() * 40) % 360);
  const sat2 = sat * 0.92;
  const light2 = Math.min(96.8, light + 0.8);

  const bg = `linear-gradient(${Math.round(115 + Math.random() * 50)}deg, hsl(${currentHue}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%) 0%, hsl(${hue2}, ${sat2.toFixed(1)}%, ${light2.toFixed(1)}%) 100%)`;
  const sidebar = `hsl(${currentHue}, ${Math.max(12, sat - 9).toFixed(1)}%, ${Math.min(97.8, light + 1.6).toFixed(1)}%)`;
  const topbarBg = `hsla(${currentHue}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%, 0.88)`;
  const surface = `rgba(255, 255, 255, 0.45)`;
  const surface2 = `hsla(${currentHue}, 22%, 20%, 0.065)`;
  const line = `hsla(${currentHue}, 18%, 20%, 0.10)`;
  const knob = `hsla(${currentHue}, 18%, 20%, 0.15)`;
  const ink = `hsl(${currentHue}, 18%, 11%)`;
  const ink2 = `hsl(${currentHue}, 12%, 32%)`;
  const ink3 = `hsl(${currentHue}, 9%, 52%)`;

  // 8 distinct harmonic color slots evenly distributed around the color wheel
  // Shuffled with a random rotation angle on every theme cycle / logo tap
  const hueShift = Math.floor(Math.random() * 360);
  const numSlots = 8;
  const highlights = {};
  const underlines = {};

  for (let slot = 1; slot <= numSlots; slot++) {
    const baseAngle = ((slot - 1) * (360 / numSlots) + hueShift) % 360;
    const h = Math.round((baseAngle + (Math.random() - 0.5) * 16 + 360) % 360);

    // High contrast (for About bio):
    // Rich pastel marker background with deep matching high-contrast ink
    highlights[`--hl-high-${slot}`] = `hsla(${h}, 86%, 77%, 0.94)`;
    highlights[`--hl-ink-high-${slot}`] = `hsl(${h}, 88%, 12%)`;

    // High contrast underline (for About bio):
    underlines[`--un-high-${slot}`] = `hsl(${h}, 88%, 40%)`;

    // Moderate / balanced lower contrast (for elsewhere across site):
    // Clear, comfortable tint with higher saturation and visible opacity
    highlights[`--hl-low-${slot}`] = `hsla(${h}, 78%, 82%, 0.72)`;
    highlights[`--hl-ink-low-${slot}`] = `hsl(${h}, 82%, 18%)`;

    // Lower contrast underline (for elsewhere):
    underlines[`--un-low-${slot}`] = `hsla(${h}, 80%, 44%, 0.72)`;
  }

  // Harmonic marker colors for the "See all life updates" button / catchy links
  // Matches the canvas theme harmoniously while having distinct, elegant button contrast
  const mark = `hsla(${currentHue}, 28%, 88%, 0.95)`;
  const markInk = `hsl(${currentHue}, 22%, 14%)`;
  const markBorder = `hsla(${currentHue}, 20%, 20%, 0.14)`;

  return {
    hue: currentHue,
    bg,
    sidebar,
    topbarBg,
    surface,
    surface2,
    line,
    knob,
    ink,
    ink2,
    ink3,
    mark,
    markInk,
    markBorder,
    highlights,
    underlines,
  };
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--sidebar', theme.sidebar);
  root.style.setProperty('--topbar-bg', theme.topbarBg);
  root.style.setProperty('--surface', theme.surface);
  root.style.setProperty('--surface-2', theme.surface2);
  root.style.setProperty('--line', theme.line);
  root.style.setProperty('--knob', theme.knob);
  root.style.setProperty('--ink', theme.ink);
  root.style.setProperty('--ink-2', theme.ink2);
  root.style.setProperty('--ink-3', theme.ink3);
  if (theme.mark) root.style.setProperty('--mark', theme.mark);
  if (theme.markInk) root.style.setProperty('--mark-ink', theme.markInk);
  if (theme.markBorder) root.style.setProperty('--mark-border', theme.markBorder);

  // Apply dynamic highlight and underline CSS variables
  if (theme.highlights) {
    Object.entries(theme.highlights).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }
  if (theme.underlines) {
    Object.entries(theme.underlines).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }
}

export function cycleTheme() {
  const theme = getRandomSubtleTheme();
  applyTheme(theme);
  return theme;
}

// Automatically choose a subtle off-white on startup instead of plain static white
if (typeof document !== 'undefined') {
  cycleTheme();
}
