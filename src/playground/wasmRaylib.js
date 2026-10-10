import { mount } from './util.js';
import { vibrate } from '../utils/haptics.js';

/**
 * startWasmRaylib:
 * WebAssembly-powered C Physics Engine featuring:
 * - Multi-type projectile dynamics (Bullets, Bouncers, Mortars, Floaty orbs)
 * - Restitution & aerodynamic drag solver compiled via clang/wasm-ld
 * - Raylib-style canvas visualizer with trajectory predictors & particle debris
 */
export const startWasmRaylib = (canvas) => mount(canvas, (s) => {
  let wasmExports = null;
  let currentProjType = 0; // 0: Bullet, 1: Bouncer, 2: Mortar, 3: Floaty
  const typeNames = ['Bullet (High Velocity)', 'Bouncer (Elastic Restitution)', 'Mortar (Explosive Impact)', 'Floaty (Aerodynamic Damping)'];

  // Projectile struct: 9 fields:
  // float x, y, vx, vy, radius, mass, restitution, drag; int active; int type; float life;
  const PROJ_STRIDE_FLOATS = 11;
  const PROJ_OFFSET_ACTIVE = 8;
  const PROJ_OFFSET_TYPE = 9;

  // Particle struct: 6 fields:
  // float x, y, vx, vy, life, maxLife; int active; int colorIdx;
  const PARTICLE_STRIDE_FLOATS = 8;
  const PARTICLE_OFFSET_ACTIVE = 6;
  const PARTICLE_OFFSET_COLOR = 7;

  // Obstacle struct: 5 fields:
  // float x, y, w, h, restitution;
  const OBS_STRIDE_FLOATS = 5;

  let initialized = false;

  // Asynchronously fetch and instantiate the compiled WebAssembly module
  fetch('/wasm/physics_sim.wasm')
    .then((res) => res.arrayBuffer())
    .then((bytes) => WebAssembly.instantiate(bytes))
    .then(({ instance }) => {
      wasmExports = instance.exports;
      if (s.w > 0 && s.h > 0) {
        wasmExports.initWorld(s.w, s.h);
        initialized = true;
      }
    })
    .catch((err) => {
      console.warn('WASM load error:', err);
    });

  // Cannon base in bottom-left corner
  const getCannonPos = () => ({
    x: Math.max(50, s.w * 0.12),
    y: s.h - Math.max(50, s.h * 0.15),
  });

  // Shoot projectile on pointer down or click
  const fire = (targetX, targetY) => {
    if (!wasmExports) return;
    const cannon = getCannonPos();
    const dx = targetX - cannon.x;
    const dy = targetY - cannon.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = Math.min(680, Math.max(220, dist * 2.2));
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    wasmExports.spawnProjectile(cannon.x, cannon.y, vx, vy, currentProjType);
    vibrate(12);

    // Cycle to next projectile type after shot
    currentProjType = (currentProjType + 1) % 4;
  };

  const handlePointerDown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    fire(px, py);
  };

  canvas.addEventListener('pointerdown', handlePointerDown);

  let lastW = 0, lastH = 0;

  return (dt) => {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);

    if (!wasmExports) {
      ctx.font = '500 13.5px var(--font)';
      ctx.fillStyle = 'var(--ink-3)';
      ctx.textAlign = 'center';
      ctx.fillText('Compiling & Initializing WebAssembly Physics Engine...', w / 2, h / 2);
      return;
    }

    // Re-init world on resize
    if (!initialized || Math.abs(w - lastW) > 10 || Math.abs(h - lastH) > 10) {
      wasmExports.initWorld(w, h);
      lastW = w;
      lastH = h;
      initialized = true;
    }

    // Run C physics simulation step in WebAssembly
    const simDt = Math.min(dt * 0.016, 0.033);
    wasmExports.updatePhysics(simDt);

    // Read pointers from WebAssembly linear memory
    const memory = new Float32Array(wasmExports.memory.buffer);
    const memoryInt = new Int32Array(wasmExports.memory.buffer);

    const projPtr = wasmExports.getProjectilesBuffer() >> 2;
    const projCount = wasmExports.getProjectileCount();

    const partPtr = wasmExports.getParticlesBuffer() >> 2;
    const partCount = wasmExports.getParticleCount();

    const obsPtr = wasmExports.getObstaclesBuffer() >> 2;
    const obsCount = wasmExports.getObstacleCount();

    // Theme colors
    const computed = getComputedStyle(document.documentElement);
    const ink = computed.getPropertyValue('--ink').trim() || '#1d1d1f';
    const ink3 = computed.getPropertyValue('--ink-3').trim() || '#8e8e93';
    const lineCol = computed.getPropertyValue('--line').trim() || 'rgba(40, 38, 28, 0.12)';
    const markBg = computed.getPropertyValue('--surface-2').trim() || 'rgba(40, 38, 28, 0.06)';

    const typeColors = [
      computed.getPropertyValue('--hl-high-8').trim() || '#f97316', // Bullet (Orange)
      computed.getPropertyValue('--hl-high-3').trim() || '#0d9488', // Bouncer (Teal)
      computed.getPropertyValue('--hl-high-7').trim() || '#e11d48', // Mortar (Rose)
      computed.getPropertyValue('--hl-high-4').trim() || '#06b6d4', // Floaty (Cyan)
    ];

    // 1. Draw Obstacles (AABB contact barriers)
    for (let i = 0; i < obsCount; i++) {
      const base = obsPtr + i * OBS_STRIDE_FLOATS;
      const ox = memory[base];
      const oy = memory[base + 1];
      const ow = memory[base + 2];
      const oh = memory[base + 3];

      ctx.fillStyle = markBg;
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(ox, oy, ow, oh, 6);
      ctx.fill();
      ctx.stroke();

      // Mechanical grip stripes
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = 1;
      for (let sx = ox + 10; sx < ox + ow - 10; sx += 12) {
        ctx.beginPath();
        ctx.moveTo(sx, oy + 4);
        ctx.lineTo(sx, oy + oh - 4);
        ctx.stroke();
      }
    }

    // 2. Draw Particle debris
    for (let i = 0; i < partCount; i++) {
      const base = partPtr + i * PARTICLE_STRIDE_FLOATS;
      const active = memoryInt[base + PARTICLE_OFFSET_ACTIVE];
      if (!active) continue;

      const px = memory[base];
      const py = memory[base + 1];
      const life = memory[base + 4];
      const maxLife = memory[base + 5];
      const colorIdx = memoryInt[base + PARTICLE_OFFSET_COLOR];
      const alpha = Math.max(0, 1 - (life / maxLife));

      ctx.fillStyle = typeColors[colorIdx % 4] || ink;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. Draw Projectiles
    for (let i = 0; i < projCount; i++) {
      const base = projPtr + i * PROJ_STRIDE_FLOATS;
      const active = memoryInt[base + PROJ_OFFSET_ACTIVE];
      if (!active) continue;

      const x = memory[base];
      const y = memory[base + 1];
      const vx = memory[base + 2];
      const vy = memory[base + 3];
      const radius = memory[base + 4];
      const type = memoryInt[base + PROJ_OFFSET_TYPE];

      const col = typeColors[type % 4];

      // Motion blur trail
      const spd = Math.hypot(vx, vy);
      if (spd > 30) {
        ctx.strokeStyle = col;
        ctx.lineWidth = radius * 0.8;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - (vx / spd) * Math.min(24, spd * 0.05), y - (vy / spd) * Math.min(24, spd * 0.05));
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Projectile body
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Core glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw Cannon Turret & Aim Guide
    const cannon = getCannonPos();
    const targetX = s.mx != null ? s.mx : w * 0.65;
    const targetY = s.my != null ? s.my : h * 0.35;
    const aimAngle = Math.atan2(targetY - cannon.y, targetX - cannon.x);

    // Trajectory dashed guide line
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = ink3;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(cannon.x, cannon.y);
    ctx.lineTo(cannon.x + Math.cos(aimAngle) * 90, cannon.y + Math.sin(aimAngle) * 90);
    ctx.stroke();
    ctx.restore();

    // Turret barrel
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(aimAngle);
    ctx.fillStyle = ink;
    ctx.fillRect(0, -5, 24, 10);
    ctx.restore();

    // Turret pivot mount
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, 11, 0, Math.PI * 2);
    ctx.fill();

    // Interactive HUD / Instructions
    ctx.font = '500 12.5px var(--font)';
    ctx.fillStyle = ink3;
    ctx.textAlign = 'left';
    ctx.fillText(`Next: ${typeNames[currentProjType]}`, 20, h - 22);

    ctx.textAlign = 'right';
    ctx.fillText('Tap / Click anywhere to fire', w - 20, h - 22);
  };
});
