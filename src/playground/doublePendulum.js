import { mount } from './util.js';

// Interactive Double Pendulum: Stable, slowed-down Lagrangian physics with sub-stepping.
export const startDoublePendulum = (canvas) => mount(canvas, (s) => {
  const g = 0.45; // Gentle gravity for unhurried, graceful cadence
  const l1 = 90, l2 = 82;
  const m1 = 10, m2 = 8;

  let th1 = Math.PI / 2 + 0.15;
  let th2 = Math.PI / 2 + 0.25;
  let w1 = 0;
  let w2 = 0;

  const trail = [];
  const MAX_TRAIL = 220;

  return (dt) => {
    const { ctx, w, h } = s;
    const cx = w / 2;
    const cy = h * 0.36;

    // Sub-stepping for rock-solid stability and zero numerical explosion
    const substeps = 4;
    const subDt = (dt * 0.38) / substeps; // Scale down overall speed to be calm and graceful

    for (let step = 0; step < substeps; step++) {
      // Gentle, smooth pointer nudge: only applies gentle torque if cursor is nearby, clamped safely
      if (s.mx != null && s.my != null) {
        const dx = s.mx - cx;
        const dy = s.my - cy;
        const targetAngle = Math.atan2(dx, dy);
        let diff = targetAngle - th1;
        // Normalize angle difference to [-PI, PI]
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const dist = Math.hypot(dx, dy);
        if (dist > 20 && dist < 320) {
          w1 += Math.sign(diff) * Math.min(Math.abs(diff) * 0.008, 0.04) * subDt;
        }
      }

      // Lagrangian equations of motion
      const dth = th1 - th2;
      const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));

      const num1 = -g * (2 * m1 + m2) * Math.sin(th1) 
        - m2 * g * Math.sin(th1 - 2 * th2) 
        - 2 * Math.sin(dth) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(dth));

      const num2 = 2 * Math.sin(dth) * (w1 * w1 * l1 * (m1 + m2) 
        + g * (m1 + m2) * Math.cos(th1) 
        + w2 * w2 * l2 * m2 * Math.cos(dth));

      const alpha1 = num1 / (den1 || 1);
      const alpha2 = num2 / (den2 || 1);

      w1 += alpha1 * subDt;
      w2 += alpha2 * subDt;

      // Natural drag damping + velocity ceiling so it can never blow up
      w1 *= 0.9996;
      w2 *= 0.9996;
      w1 = Math.max(-0.25, Math.min(0.25, w1));
      w2 = Math.max(-0.35, Math.min(0.35, w2));

      th1 += w1 * subDt;
      th2 += w2 * subDt;
    }

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
