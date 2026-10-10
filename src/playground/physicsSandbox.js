import { mount } from './util.js';
import { vibrate } from '../utils/haptics.js';

/**
 * 2D Rigid Body & Particle Physics Sandbox
 * 
 * Features:
 * - 2D geometry shapes: Circles, Rectangles, Equilateral/Right Triangles, Lines/Capsules, Pentagons.
 * - Slingshot drag-and-pull mechanic: Grab any shape to apply force/acceleration vector with trajectory preview.
 * - Spawner toolbars on-canvas: Tap buttons on top to spawn new shapes or clear the world.
 * - Realistic Physics:
 *   - Gravity & Inertia
 *   - Velocity & Acceleration integration (Euler / Verlet)
 *   - Elastic & Inelastic Collisions (Circle-Circle, Circle-Box, Polygon/Box boundaries, Restitution bounciness)
 *   - Air resistance & Ground friction
 *   - Angular velocity / torque on collisions
 *   - Impact spark particles
 */

export const startPhysicsSandbox = (canvas) => mount(canvas, (s) => {
  const shapes = [];
  const sparks = [];
  let initialized = false;

  // Selected tool for spawning
  let currentShapeType = 'circle'; // 'circle' | 'rect' | 'triangle' | 'line' | 'pentagon'
  const shapeTypes = [
    { id: 'circle', label: 'Circle', icon: '●' },
    { id: 'rect', label: 'Box', icon: '■' },
    { id: 'triangle', label: 'Triangle', icon: '▲' },
    { id: 'pentagon', label: 'Pentagon', icon: '⬟' },
    { id: 'line', label: 'Beam', icon: '━' },
  ];

  // Dragging state
  let draggedShape = null;
  let dragStart = { x: 0, y: 0 };
  let dragCurrent = { x: 0, y: 0 };
  let isDragging = false;
  let hasMoved = false;

  // Physics constants
  const GRAVITY = 980; // px/s^2
  const AIR_DRAG = 0.998;
  const SURFACE_FRICTION = 0.94;

  const PALETTE = [
    { fill: '#f59e0b', stroke: '#d97706', glow: 'rgba(245, 158, 11, 0.35)' }, // amber
    { fill: '#06b6d4', stroke: '#0891b2', glow: 'rgba(6, 182, 212, 0.35)' },  // cyan
    { fill: '#ec4899', stroke: '#db2777', glow: 'rgba(236, 72, 153, 0.35)' }, // pink/rose
    { fill: '#10b981', stroke: '#059669', glow: 'rgba(16, 185, 129, 0.35)' }, // emerald
    { fill: '#8b5cf6', stroke: '#7c3aed', glow: 'rgba(139, 92, 246, 0.35)' }, // violet
    { fill: '#f97316', stroke: '#ea580c', glow: 'rgba(249, 115, 22, 0.35)' }, // orange
  ];

  const createShape = (type, x, y, vx = 0, vy = 0) => {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const base = {
      type,
      x,
      y,
      vx,
      vy,
      angle: (Math.random() - 0.5) * 0.5,
      va: (Math.random() - 0.5) * 3, // angular velocity
      color,
      restitution: 0.72 + Math.random() * 0.15, // bounciness
      mass: 1,
      pinned: false,
    };

    if (type === 'circle') {
      const radius = 18 + Math.random() * 12;
      return { ...base, radius, mass: (radius * radius) / 400 };
    }
    if (type === 'rect') {
      const w = 34 + Math.random() * 22;
      const h = 24 + Math.random() * 20;
      const radius = Math.hypot(w, h) / 2;
      return { ...base, w, h, radius, mass: (w * h) / 600 };
    }
    if (type === 'triangle') {
      const size = 30 + Math.random() * 16;
      return { ...base, size, radius: size * 0.65, mass: (size * size) / 500 };
    }
    if (type === 'pentagon') {
      const radius = 22 + Math.random() * 10;
      return { ...base, radius, mass: (radius * radius) / 380 };
    }
    if (type === 'line') {
      const length = 55 + Math.random() * 30;
      const thickness = 10;
      return { ...base, length, thickness, radius: length / 2, mass: (length * thickness) / 300 };
    }
    return base;
  };

  const spawnSparks = (x, y, color, count = 7) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 140;
      sparks.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        color,
        life: 1.0,
        decay: 2.2 + Math.random() * 1.5,
        size: 1.5 + Math.random() * 2,
      });
    }
  };

  const initWorld = (w, h) => {
    shapes.length = 0;
    sparks.length = 0;
    // Spawn initial pleasing set of shapes
    const types = ['circle', 'rect', 'triangle', 'pentagon', 'line', 'circle'];
    const count = Math.min(types.length, Math.floor(w / 110));
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1);
      const sType = types[i % types.length];
      const newShape = createShape(
        sType,
        w * t,
        h * 0.25 + (i % 2) * 50,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40
      );
      shapes.push(newShape);
    }
  };

  // Helper: check if pointer hit shape
  const hitTest = (px, py, shape) => {
    const d = Math.hypot(shape.x - px, shape.y - py);
    return d <= shape.radius + 8;
  };

  // UI buttons bounds
  const getUiButtons = (w) => {
    const btnW = Math.min(68, Math.max(50, Math.floor((w - 120) / (shapeTypes.length + 1))));
    const btnH = 28;
    const startX = 14;
    const y = 14;
    const buttons = shapeTypes.map((st, i) => ({
      id: st.id,
      label: st.icon + ' ' + st.label,
      x: startX + i * (btnW + 6),
      y,
      w: btnW,
      h: btnH,
      active: currentShapeType === st.id,
    }));

    // Add Clear / Reset button on top right
    const resetW = 56;
    buttons.push({
      id: 'reset',
      label: '↺ Reset',
      x: w - resetW - 14,
      y,
      w: resetW,
      h: btnH,
      isAction: true,
    });

    return buttons;
  };

  // Custom pointer down handler
  const onPointerDown = (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    // Check UI buttons first
    const buttons = getUiButtons(s.w);
    for (const btn of buttons) {
      if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
        if (btn.id === 'reset') {
          initWorld(s.w, s.h);
          vibrate(18);
        } else {
          currentShapeType = btn.id;
          vibrate(10);
        }
        return;
      }
    }

    // Check shapes under pointer (topmost last)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const sh = shapes[i];
      if (hitTest(px, py, sh)) {
        draggedShape = sh;
        dragStart = { x: sh.x, y: sh.y };
        dragCurrent = { x: px, y: py };
        isDragging = true;
        hasMoved = false;
        sh.vx = 0;
        sh.vy = 0;
        vibrate(8);
        return;
      }
    }

    // If tapped empty space: spawn current shape!
    if (py > 50 && shapes.length < 32) {
      const newSh = createShape(currentShapeType, px, py, (Math.random() - 0.5) * 40, -60);
      shapes.push(newSh);
      spawnSparks(px, py, newSh.color.fill, 5);
      vibrate(12);
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging || !draggedShape) return;
    const r = canvas.getBoundingClientRect();
    dragCurrent = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (Math.hypot(dragCurrent.x - dragStart.x, dragCurrent.y - dragStart.y) > 6) {
      hasMoved = true;
    }
  };

  const onPointerUp = (e) => {
    if (isDragging && draggedShape) {
      if (hasMoved) {
        // Slingshot release: acceleration inversely proportional to pull vector
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const pullDist = Math.hypot(dx, dy);
        const impulse = Math.min(pullDist * 6.5, 950);
        const angle = Math.atan2(dy, dx);

        draggedShape.vx = Math.cos(angle) * impulse;
        draggedShape.vy = Math.sin(angle) * impulse;
        draggedShape.va = (Math.random() - 0.5) * 12;
        vibrate(22);
        spawnSparks(draggedShape.x, draggedShape.y, draggedShape.color.fill, 8);
      }
    }
    isDragging = false;
    draggedShape = null;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  return (rawDt) => {
    const { ctx, w, h } = s;
    if (w === 0 || h === 0) return;
    if (!initialized) {
      initWorld(w, h);
      initialized = true;
    }

    const dt = Math.min(rawDt * 0.016, 0.033);

    // 1. Update Physics
    for (let i = 0; i < shapes.length; i++) {
      const a = shapes[i];

      if (a === draggedShape && isDragging) {
        // Being held: smooth follower
        a.x = dragStart.x;
        a.y = dragStart.y;
        continue;
      }

      // Gravity & Air Drag
      a.vy += GRAVITY * dt;
      a.vx *= AIR_DRAG;
      a.vy *= AIR_DRAG;
      a.va *= 0.99;

      // Position & Angle Integration
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.angle += a.va * dt;

      // Wall / Floor Boundary Collisions
      const floor = h - 18;
      const ceiling = 52;
      const leftWall = 16;
      const rightWall = w - 16;

      // Floor
      if (a.y + a.radius > floor) {
        a.y = floor - a.radius;
        if (a.vy > 0) {
          a.vy = -a.vy * a.restitution;
          a.vx *= SURFACE_FRICTION;
          a.va *= 0.85;
          if (Math.abs(a.vy) > 60) spawnSparks(a.x, floor, a.color.fill, 3);
        }
      }
      // Ceiling
      if (a.y - a.radius < ceiling) {
        a.y = ceiling + a.radius;
        if (a.vy < 0) {
          a.vy = -a.vy * a.restitution;
          a.vx *= SURFACE_FRICTION;
        }
      }
      // Left Wall
      if (a.x - a.radius < leftWall) {
        a.x = leftWall + a.radius;
        if (a.vx < 0) {
          a.vx = -a.vx * a.restitution;
          a.va += a.vy * 0.02;
        }
      }
      // Right Wall
      if (a.x + a.radius > rightWall) {
        a.x = rightWall - a.radius;
        if (a.vx > 0) {
          a.vx = -a.vx * a.restitution;
          a.va -= a.vy * 0.02;
        }
      }
    }

    // 2. Pairwise Collision Solver
    for (let i = 0; i < shapes.length; i++) {
      const a = shapes[i];
      for (let j = i + 1; j < shapes.length; j++) {
        const b = shapes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0.001) {
          // Normal vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Separate overlapping shapes
          const overlap = minDist - dist;
          const sepA = a === draggedShape ? 0 : (b === draggedShape ? 1 : 0.5);
          const sepB = b === draggedShape ? 0 : (a === draggedShape ? 1 : 0.5);
          a.x -= nx * overlap * sepA;
          a.y -= ny * overlap * sepA;
          b.x += nx * overlap * sepB;
          b.y += ny * overlap * sepB;

          // Relative velocity
          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          // Only collide if moving toward each other
          if (velAlongNormal < 0) {
            const restitution = Math.min(a.restitution, b.restitution);
            const impulseMag = -(1 + restitution) * velAlongNormal / (1 / a.mass + 1 / b.mass);

            const impX = impulseMag * nx;
            const impY = impulseMag * ny;

            if (a !== draggedShape) {
              a.vx -= impX / a.mass;
              a.vy -= impY / a.mass;
              a.va += (Math.random() - 0.5) * 4;
            }
            if (b !== draggedShape) {
              b.vx += impX / b.mass;
              b.vy += impY / b.mass;
              b.va += (Math.random() - 0.5) * 4;
            }

            if (Math.abs(velAlongNormal) > 100) {
              const midX = a.x + nx * a.radius;
              const midY = a.y + ny * a.radius;
              spawnSparks(midX, midY, a.color.fill, 4);
            }
          }
        }
      }
    }

    // 3. Update Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 450 * dt;
      sp.life -= sp.decay * dt;
      if (sp.life <= 0) sparks.splice(i, 1);
    }

    // 4. Render
    ctx.clearRect(0, 0, w, h);

    // Floor boundary line
    ctx.beginPath();
    ctx.moveTo(16, h - 18);
    ctx.lineTo(w - 16, h - 18);
    ctx.strokeStyle = 'rgba(128, 128, 138, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw shapes
    for (const sh of shapes) {
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.angle);

      ctx.fillStyle = sh.color.fill;
      ctx.strokeStyle = sh.color.stroke;
      ctx.lineWidth = 2;
      ctx.shadowColor = sh.color.glow;
      ctx.shadowBlur = 10;

      if (sh.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, sh.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Inner rolling orientation pip
        ctx.beginPath();
        ctx.arc(sh.radius * 0.5, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
      } else if (sh.type === 'rect') {
        ctx.beginPath();
        ctx.roundRect(-sh.w / 2, -sh.h / 2, sh.w, sh.h, 6);
        ctx.fill();
        ctx.stroke();
      } else if (sh.type === 'triangle') {
        const r = sh.size * 0.65;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.866, r * 0.5);
        ctx.lineTo(-r * 0.866, r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (sh.type === 'pentagon') {
        const r = sh.radius;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (sh.type === 'line') {
        ctx.beginPath();
        ctx.roundRect(-sh.length / 2, -sh.thickness / 2, sh.length, sh.thickness, 5);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw Sparks
    for (const sp of sparks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Slingshot Vector if Dragging
    if (isDragging && draggedShape && hasMoved) {
      const pullX = dragStart.x - dragCurrent.x;
      const pullY = dragStart.y - dragCurrent.y;
      const pullDist = Math.hypot(pullX, pullY);

      // Trajectory arrow in opposite direction of pull
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Acceleration impulse forecast line
      const forceLen = Math.min(pullDist * 1.6, 180);
      const ang = Math.atan2(pullY, pullX);
      const launchX = dragStart.x + Math.cos(ang) * forceLen;
      const launchY = dragStart.y + Math.sin(ang) * forceLen;

      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(launchX, launchY);
      ctx.strokeStyle = draggedShape.color.fill;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = draggedShape.color.glow;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Arrowhead
      const headLen = 10;
      ctx.beginPath();
      ctx.moveTo(launchX, launchY);
      ctx.lineTo(launchX - headLen * Math.cos(ang - Math.PI / 6), launchY - headLen * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(launchX - headLen * Math.cos(ang + Math.PI / 6), launchY - headLen * Math.sin(ang + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = draggedShape.color.fill;
      ctx.fill();

      // Speed readout badge
      const speedVal = Math.round(Math.min(pullDist * 6.5, 950));
      ctx.fillStyle = 'rgba(20, 20, 22, 0.85)';
      ctx.roundRect(launchX + 10, launchY - 14, 60, 20, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(`${speedVal} px/s`, launchX + 16, launchY);

      ctx.restore();
    }

    // Draw UI Top Bar
    const buttons = getUiButtons(w);
    for (const btn of buttons) {
      ctx.save();
      if (btn.active) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
      }
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = btn.active ? '#f59e0b' : 'rgba(255, 255, 255, 0.85)';
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      ctx.restore();
    }

    // Helper hint text
    ctx.save();
    ctx.fillStyle = 'rgba(140, 140, 150, 0.6)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to spawn · Drag & pull to slingshot with acceleration', w / 2, h - 6);
    ctx.restore();
  };
});
