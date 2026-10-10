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

  // Subtle saturation (12% - 20%) so it is a delicate whisper of color, never neon or loud
  const sat = 13 + Math.random() * 7;
  // High lightness (96.0% - 97.4%) so it reads as a clean, sophisticated off-white
  const light = 96.0 + Math.random() * 1.4;

  const sidebarLight = Math.min(98.3, light + 1.2);
  const sidebarSat = Math.max(7, sat - 5);

  const bg = `hsl(${currentHue}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%)`;
  const sidebar = `hsl(${currentHue}, ${sidebarSat.toFixed(1)}%, ${sidebarLight.toFixed(1)}%)`;
  const topbarBg = `hsla(${currentHue}, ${sat.toFixed(1)}%, ${light.toFixed(1)}%, 0.88)`;
  const surface = `rgba(255, 255, 255, 0.42)`;
  const surface2 = `hsla(${currentHue}, 20%, 20%, 0.055)`;
  const line = `hsla(${currentHue}, 15%, 20%, 0.09)`;
  const knob = `hsla(${currentHue}, 15%, 20%, 0.14)`;
  const ink = `hsl(${currentHue}, 16%, 11%)`;
  const ink2 = `hsl(${currentHue}, 10%, 33%)`;
  const ink3 = `hsl(${currentHue}, 8%, 54%)`;

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

  // Dynamic vibrant marker colors for the "See all life updates" button / catchy links
  const markerHue = (currentHue + 45 + Math.floor(Math.random() * 60)) % 360;
  const mark = `hsl(${markerHue}, 94%, 56%)`;
  const markInk = `hsl(${markerHue}, 96%, 10%)`;

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
