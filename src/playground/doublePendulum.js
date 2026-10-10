import { mount } from './util.js';

// Interactive Double Pendulum: Deterministic chaos with trail rendering. Pointer can nudge or pull the bobs.
export const startDoublePendulum = (canvas) => mount(canvas, (s) => {
  const g = 0.98;
  const l1 = 85, l2 = 80;
  const m1 = 10, m2 = 10;

  let th1 = Math.PI / 2 + 0.1;
  let th2 = Math.PI / 2 + 0.2;
  let w1 = 0;
  let w2 = 0;

  const trail = [];
  const MAX_TRAIL = 180;

  return (dt) => {
    const { ctx, w, h } = s;
    const cx = w / 2;
    const cy = h * 0.38;

    // Pointer nudge / interaction
    if (s.mx != null && s.my != null) {
      const dx = s.mx - cx;
      const dy = s.my - cy;
      const targetAngle = Math.atan2(dx, dy);
      w1 += (targetAngle - th1) * 0.04 * dt;
    }

    // Double pendulum Lagrangian physics equations
    const dth = th1 - th2;
    const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
    const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));

    const num1 = -g * (2 * m1 + m2) * Math.sin(th1) - m2 * g * Math.sin(th1 - 2 * th2) - 2 * Math.sin(dth) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(dth));
    const num2 = 2 * Math.sin(dth) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) + w2 * w2 * l2 * m2 * Math.cos(dth));

    const alpha1 = num1 / (den1 || 1);
    const alpha2 = num2 / (den2 || 1);

    w1 += alpha1 * dt * 0.45;
    w2 += alpha2 * dt * 0.45;
    w1 *= 0.999; // Air damping
    w2 *= 0.999;
    th1 += w1 * dt * 0.45;
    th2 += w2 * dt * 0.45;

    // Compute bob positions
    const x1 = cx + l1 * Math.sin(th1);
    const y1 = cy + l1 * Math.cos(th1);
    const x2 = x1 + l2 * Math.sin(th2);
    const y2 = y1 + l2 * Math.cos(th2);

    trail.push({ x: x2, y: y2 });
    if (trail.length > MAX_TRAIL) trail.shift();

    // Render
    ctx.clearRect(0, 0, w, h);

    // Draw fading chaotic trail
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.45;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(225, 45, 110, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    }

    // Draw rods
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = s.dark ? 'rgba(255,255,255,0.45)' : 'rgba(29,29,31,0.45)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Draw center anchor
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = s.dark ? '#ffffff' : '#1d1d1f';
    ctx.fill();

    // Draw bob 1
    ctx.beginPath();
    ctx.arc(x1, y1, 6, 0, Math.PI * 2);
    ctx.fillStyle = s.dark ? '#e5e5ea' : '#3a3a3c';
    ctx.fill();

    // Draw bob 2
    ctx.beginPath();
    ctx.arc(x2, y2, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e12d6e';
    ctx.fill();
  };
});
