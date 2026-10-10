import { mount } from './util.js';

// Flocking: separation + alignment + cohesion. The pointer is a predator the flock flees from.
export const startBoids = (canvas) => mount(canvas, (s) => {
  const N = 110;
  const b = Array.from({ length: N }, () => ({ x: Math.random() * 600, y: Math.random() * 400, vx: Math.random() - 0.5, vy: Math.random() - 0.5 }));
  return (dt) => {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = s.dark ? '#f5f5f7' : '#1d1d1f';
    for (const p of b) {
      let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
      for (const q of b) {
        if (q === p) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 3600) { n++; ax += q.vx; ay += q.vy; cx += q.x; cy += q.y; if (d2 < 400) { sx -= dx; sy -= dy; } }
      }
      if (n) { p.vx += ((ax / n - p.vx) * 0.05 + (cx / n - p.x) * 0.0008 + sx * 0.02) * dt; p.vy += ((ay / n - p.vy) * 0.05 + (cy / n - p.y) * 0.0008 + sy * 0.02) * dt; }
      if (s.mx != null) {
        const dx = p.x - s.mx, dy = p.y - s.my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { p.vx += (dx / Math.sqrt(d2 + 1)) * 0.35 * dt; p.vy += (dy / Math.sqrt(d2 + 1)) * 0.35 * dt; }
      }
      const sp = Math.hypot(p.vx, p.vy) || 1, k = Math.min(Math.max(sp, 1.2), 2.6) / sp;
      p.vx *= k; p.vy *= k;
      p.x = (p.x + p.vx * dt * 1.4 + w) % w; p.y = (p.y + p.vy * dt * 1.4 + h) % h;
      const a = Math.atan2(p.vy, p.vx);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, 3.2); ctx.lineTo(-4, -3.2); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
});
