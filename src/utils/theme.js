/**
 * Dynamic subtle off-white canvas generator.
 * Algorithmically samples hues across the 360° color wheel
 * to generate ultra-subtle whites / off-whites with gentle tints.
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
