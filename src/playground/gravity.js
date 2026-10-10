import { mount } from './util.js';

// Particles orbiting a gravity well. The pointer drags the well; trails fade like long exposure.
export const startGravity = (canvas) => mount(canvas, (s) => {
  const N = 360;
  const ps = Array.from({ length: N }, () => { const a = Math.random() * 6.283, r = 40 + Math.random() * 180; return { a, r, x: 0, y: 0, vx: -Math.sin(a) * 1.6, vy: Math.cos(a) * 1.6, init: false, r0: r }; });
  const well = { x: 0, y: 0, ready: false };
  return (dt) => {
    const { ctx, w, h } = s;
    if (!well.ready) { well.x = w / 2; well.y = h / 2; well.ready = true; ps.forEach((p) => { p.x = well.x + Math.cos(p.a) * p.r; p.y = well.y + Math.sin(p.a) * p.r; }); }
    const tx = s.mx ?? w / 2, ty = s.my ?? h / 2;
    well.x += (tx - well.x) * 0.08 * dt; well.y += (ty - well.y) * 0.08 * dt;
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = s.dark ? '#f5f5f7' : '#1d1d1f';
    for (const p of ps) {
      const dx = well.x - p.x, dy = well.y - p.y, d2 = dx * dx + dy * dy + 400, d = Math.sqrt(d2), f = 900 / d2;
      p.vx += (dx / d) * f * dt; p.vy += (dy / d) * f * dt;
      p.vx *= 0.9995; p.vy *= 0.9995;
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.fillRect(p.x, p.y, 1.8, 1.8);
    }
  };
});
