import { mount } from './util.js';
import { vibrate } from '../utils/haptics.js';

/**
 * 2D Multi-Body Rigid & Particle Physics Sandbox
 * 
 * Powered by a high-performance WebAssembly (WASM) kernel compiled from C.
 * Features:
 * - 2D geometry primitives: Circle, Box, Triangle, Pentagon, Beam.
 * - Slingshot drag-and-pull mechanic: Grab any shape to apply force/acceleration vector with trajectory preview.
 * - Spawner toolbars on-canvas: Tap buttons on top to spawn new shapes or clear the world.
 * - WebAssembly C physics engine:
 *   - Gravity & Inertia
 *   - Velocity & Acceleration integration (Euler / Verlet)
 *   - Elastic & Inelastic Collisions (Circle-Circle, Circle-Box, Polygon/Box boundaries, Restitution bounciness)
 *   - Air resistance & Ground friction
 *   - Angular velocity / torque on collisions
 *   - Impact spark particles
 */

export const startPhysicsSandbox = (canvas) => mount(canvas, (s) => {
  let wasmExports = null;
  let wasmMemory = null;
  let initialized = false;

  // Selected tool for spawning
  let currentShapeType = 0; // 0: circle, 1: rect, 2: triangle, 3: pentagon, 4: line
  const shapeTypes = [
    { id: 0, label: 'Circle', icon: '●' },
    { id: 1, label: 'Box', icon: '■' },
    { id: 2, label: 'Triangle', icon: '▲' },
    { id: 3, label: 'Pentagon', icon: '⬟' },
    { id: 4, label: 'Beam', icon: '━' },
  ];

  // Dragging state
  let draggedIndex = -1;
  let dragStart = { x: 0, y: 0 };
  let dragCurrent = { x: 0, y: 0 };
  let isDragging = false;
  let hasMoved = false;

  const PALETTE = [
    { fill: '#f59e0b', stroke: '#d97706', glow: 'rgba(245, 158, 11, 0.35)' }, // amber
    { fill: '#06b6d4', stroke: '#0891b2', glow: 'rgba(6, 182, 212, 0.35)' },  // cyan
    { fill: '#ec4899', stroke: '#db2777', glow: 'rgba(236, 72, 153, 0.35)' }, // pink/rose
    { fill: '#10b981', stroke: '#059669', glow: 'rgba(16, 185, 129, 0.35)' }, // emerald
    { fill: '#8b5cf6', stroke: '#7c3aed', glow: 'rgba(139, 92, 246, 0.35)' }, // violet
    { fill: '#f97316', stroke: '#ea580c', glow: 'rgba(249, 115, 22, 0.35)' }, // orange
  ];

  // Body struct layout in C (11 floats/ints = 44 bytes):
  // float x, y, vx, vy, angle, va, radius, w, h, mass, restitution; int shapeType; int colorIdx; int active;
  const BODY_STRIDE_BYTES = 56; // 14 fields * 4 bytes
  const BODY_OFFSET_X = 0;
  const BODY_OFFSET_Y = 1;
  const BODY_OFFSET_VX = 2;
  const BODY_OFFSET_VY = 3;
  const BODY_OFFSET_ANGLE = 4;
  const BODY_OFFSET_VA = 5;
  const BODY_OFFSET_RADIUS = 6;
  const BODY_OFFSET_W = 7;
  const BODY_OFFSET_H = 8;
  const BODY_OFFSET_MASS = 9;
  const BODY_OFFSET_RESTITUTION = 10;
  const BODY_OFFSET_TYPE = 11;
  const BODY_OFFSET_COLOR = 12;
  const BODY_OFFSET_ACTIVE = 13;

  // Spark struct layout in C (8 fields * 4 bytes):
  // float x, y, vx, vy, life, maxLife; int colorIdx; int active;
  const SPARK_STRIDE_BYTES = 32;

  // Asynchronously fetch and instantiate the freestanding WASM module
  fetch('/wasm/physics_sim.wasm')
    .then((res) => res.arrayBuffer())
    .then((bytes) => WebAssembly.instantiate(bytes))
    .then(({ instance }) => {
      wasmExports = instance.exports;
      wasmMemory = instance.exports.memory;
      if (s.w > 0 && s.h > 0) {
        initWorld(s.w, s.h);
        initialized = true;
      }
    })
    .catch((err) => {
      console.warn('WASM load error:', err);
    });

  const initWorld = (w, h) => {
    if (!wasmExports) return;
    wasmExports.initPhysicsWorld(w, h);
    // Spawn initial pleasing set of shapes
    const types = [0, 1, 2, 3, 4, 0];
    const count = Math.min(types.length, Math.floor(w / 110));
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1);
      const colorIdx = i % PALETTE.length;
      wasmExports.spawnBody(
        types[i % types.length],
        w * t,
        h * 0.25 + (i % 2) * 50,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        colorIdx
      );
    }
  };

  // Helper: check if pointer hit body
  const findBodyAt = (px, py) => {
    if (!wasmExports || !wasmMemory) return -1;
    const bodiesPtr = wasmExports.getBodiesBuffer();
    const maxBodies = wasmExports.getMaxBodies();
    const floatView = new Float32Array(wasmMemory.buffer, bodiesPtr, maxBodies * 14);
    const intView = new Int32Array(wasmMemory.buffer, bodiesPtr, maxBodies * 14);

    for (let i = maxBodies - 1; i >= 0; i--) {
      const base = i * 14;
      if (!intView[base + BODY_OFFSET_ACTIVE]) continue;
      const bx = floatView[base + BODY_OFFSET_X];
      const by = floatView[base + BODY_OFFSET_Y];
      const radius = floatView[base + BODY_OFFSET_RADIUS];
      const d = Math.hypot(bx - px, by - py);
      if (d <= radius + 8) return i;
    }
    return -1;
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

  // Pointer interactions
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

    if (!wasmExports || !wasmMemory) return;

    // Check shapes under pointer
    const hitIndex = findBodyAt(px, py);
    if (hitIndex !== -1) {
      const bodiesPtr = wasmExports.getBodiesBuffer();
      const floatView = new Float32Array(wasmMemory.buffer, bodiesPtr, hitIndex * 14 + 14);
      draggedIndex = hitIndex;
      dragStart = { x: floatView[hitIndex * 14 + BODY_OFFSET_X], y: floatView[hitIndex * 14 + BODY_OFFSET_Y] };
      dragCurrent = { x: px, y: py };
      isDragging = true;
      hasMoved = false;
      // Halt velocity while holding
      floatView[hitIndex * 14 + BODY_OFFSET_VX] = 0;
      floatView[hitIndex * 14 + BODY_OFFSET_VY] = 0;
      vibrate(8);
      return;
    }

    // Tap to spawn new body
    if (py > 50) {
      const colorIdx = Math.floor(Math.random() * PALETTE.length);
      wasmExports.spawnBody(currentShapeType, px, py, (Math.random() - 0.5) * 40, -60, colorIdx);
      vibrate(12);
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging || draggedIndex === -1) return;
    const r = canvas.getBoundingClientRect();
    dragCurrent = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (Math.hypot(dragCurrent.x - dragStart.x, dragCurrent.y - dragStart.y) > 6) {
      hasMoved = true;
    }
  };

  const onPointerUp = () => {
    if (isDragging && draggedIndex !== -1 && wasmExports) {
      if (hasMoved) {
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const pullDist = Math.hypot(dx, dy);
        const impulse = Math.min(pullDist * 6.5, 950);
        const angle = Math.atan2(dy, dx);

        const vx = Math.cos(angle) * impulse;
        const vy = Math.sin(angle) * impulse;
        const va = (Math.random() - 0.5) * 12;

        wasmExports.applyImpulse(draggedIndex, vx, vy, va);
        vibrate(22);
      }
    }
    isDragging = false;
    draggedIndex = -1;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  return (rawDt) => {
    const { ctx, w, h } = s;
    if (w === 0 || h === 0) return;

    if (!initialized && wasmExports) {
      initWorld(w, h);
      initialized = true;
    }

    const dt = Math.min(rawDt * 0.016, 0.033);

    // Step WebAssembly physics kernel
    if (wasmExports) {
      wasmExports.stepPhysics(dt);
    }

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

    if (wasmExports && wasmMemory) {
      const bodiesPtr = wasmExports.getBodiesBuffer();
      const maxBodies = wasmExports.getMaxBodies();
      const floatView = new Float32Array(wasmMemory.buffer, bodiesPtr, maxBodies * 14);
      const intView = new Int32Array(wasmMemory.buffer, bodiesPtr, maxBodies * 14);

      // Render bodies
      for (let i = 0; i < maxBodies; i++) {
        const base = i * 14;
        if (!intView[base + BODY_OFFSET_ACTIVE]) continue;

        let bx = floatView[base + BODY_OFFSET_X];
        let by = floatView[base + BODY_OFFSET_Y];
        const angle = floatView[base + BODY_OFFSET_ANGLE];
        const radius = floatView[base + BODY_OFFSET_RADIUS];
        const bw = floatView[base + BODY_OFFSET_W];
        const bh = floatView[base + BODY_OFFSET_H];
        const shapeType = intView[base + BODY_OFFSET_TYPE];
        const colorIdx = intView[base + BODY_OFFSET_COLOR];
        const color = PALETTE[colorIdx % PALETTE.length];

        // While dragging, pin position to start
        if (isDragging && i === draggedIndex) {
          bx = dragStart.x;
          by = dragStart.y;
          floatView[base + BODY_OFFSET_X] = bx;
          floatView[base + BODY_OFFSET_Y] = by;
        }

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle);

        ctx.fillStyle = color.fill;
        ctx.strokeStyle = color.stroke;
        ctx.lineWidth = 2;
        ctx.shadowColor = color.glow;
        ctx.shadowBlur = 10;

        if (shapeType === 0) { // Circle
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Inner rolling pip
          ctx.beginPath();
          ctx.arc(radius * 0.5, 0, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        } else if (shapeType === 1) { // Box
          ctx.beginPath();
          ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
          ctx.fill();
          ctx.stroke();
        } else if (shapeType === 2) { // Triangle
          const r = bw * 0.65;
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.866, r * 0.5);
          ctx.lineTo(-r * 0.866, r * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (shapeType === 3) { // Pentagon
          const r = radius;
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
        } else { // Beam / Line
          ctx.beginPath();
          ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 5);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }

      // Render sparks
      const sparksPtr = wasmExports.getSparksBuffer();
      const maxSparks = wasmExports.getMaxSparks();
      const sparkFloatView = new Float32Array(wasmMemory.buffer, sparksPtr, maxSparks * 8);
      const sparkIntView = new Int32Array(wasmMemory.buffer, sparksPtr, maxSparks * 8);

      for (let i = 0; i < maxSparks; i++) {
        const sBase = i * 8;
        if (!sparkIntView[sBase + 7]) continue; // active
        const sx = sparkFloatView[sBase + 0];
        const sy = sparkFloatView[sBase + 1];
        const life = sparkFloatView[sBase + 4];
        const maxLife = sparkFloatView[sBase + 5];
        const colorIdx = sparkIntView[sBase + 6];
        const color = PALETTE[colorIdx % PALETTE.length];

        const alpha = Math.max(0, 1 - life / maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color.fill;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Slingshot Vector if Dragging
      if (isDragging && draggedIndex !== -1 && hasMoved) {
        const pullX = dragStart.x - dragCurrent.x;
        const pullY = dragStart.y - dragCurrent.y;
        const pullDist = Math.hypot(pullX, pullY);

        ctx.save();
        // Dotted tether
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Forward impulse arrow
        const forceLen = Math.min(pullDist * 1.6, 180);
        const ang = Math.atan2(pullY, pullX);
        const launchX = dragStart.x + Math.cos(ang) * forceLen;
        const launchY = dragStart.y + Math.sin(ang) * forceLen;

        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(launchX, launchY);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Arrowhead
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(launchX, launchY);
        ctx.lineTo(launchX - headLen * Math.cos(ang - Math.PI / 6), launchY - headLen * Math.sin(ang - Math.PI / 6));
        ctx.lineTo(launchX - headLen * Math.cos(ang + Math.PI / 6), launchY - headLen * Math.sin(ang + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Speed badge
        const speedVal = Math.round(Math.min(pullDist * 6.5, 950));
        ctx.fillStyle = 'rgba(20, 20, 22, 0.85)';
        ctx.roundRect(launchX + 10, launchY - 14, 60, 20, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`${speedVal} px/s`, launchX + 16, launchY);

        ctx.restore();
      }
    }

    // Draw UI Top Bar with high contrast for off-white theme
    const buttons = getUiButtons(w);
    for (const btn of buttons) {
      ctx.save();
      if (btn.active) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.6;
      } else {
        ctx.fillStyle = 'rgba(20, 20, 25, 0.06)';
        ctx.strokeStyle = 'rgba(20, 20, 25, 0.18)';
        ctx.lineWidth = 1;
      }
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = btn.active ? '#b45309' : '#1c1917';
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      ctx.restore();
    }

    // Hint text
    ctx.save();
    ctx.fillStyle = 'rgba(30, 30, 35, 0.55)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to spawn · Drag & pull to slingshot with acceleration', w / 2, h - 6);
    ctx.restore();
  };
});
