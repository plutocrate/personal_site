import { mount } from './util.js';
import { vibrate } from '../utils/haptics.js';

/**
 * 3D Utah Teapot Simulation
 * 
 * Raylib-style high-performance 3D graphics and angular physics simulation
 * compiled from native C into freestanding WebAssembly (WASM).
 * Features:
 * - Parametric Utah Teapot 3D topology (Body rings, lid knob, curved spout, loop handle)
 * - 3D Euler rotation matrix transformation & projective camera mathematics
 * - Gyroscopic inertia: Drag and flick the teapot to give it angular momentum
 * - Dynamic Phong illumination: Edges and vertices shaded by normal depth & light angle
 * - Mode toggle: Wireframe, Shaded Nodes, and Speed readouts
 */

export const startTeapot = (canvas) => mount(canvas, (s) => {
  let wasmExports = null;
  let wasmMemory = null;
  let initialized = false;

  let isDragging = false;
  let lastPointer = { x: 0, y: 0 };
  let currentHue = 195; // Cyan / Electric blue
  let renderMode = 'solid'; // 'solid' | 'wire'
  let fillFaces = true; // Toggle for coloring / filling the whole body of the teapot

  fetch('/wasm/teapot_sim.wasm')
    .then((res) => res.arrayBuffer())
    .then((bytes) => WebAssembly.instantiate(bytes))
    .then(({ instance }) => {
      wasmExports = instance.exports;
      wasmMemory = instance.exports.memory;
      wasmExports.initTeapot();
      initialized = true;
    })
    .catch((err) => {
      console.warn('Teapot WASM load error:', err);
    });

  const onPointerDown = (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    // Check mode toggle buttons on top
    if (py < 48) {
      // 1. Shaded Mesh / Wireframe toggle
      if (px >= 14 && px <= 118) {
        renderMode = renderMode === 'solid' ? 'wire' : 'solid';
        vibrate(12);
        return;
      }
      // 2. Body Fill toggle
      if (px >= 126 && px <= 222) {
        fillFaces = !fillFaces;
        vibrate(12);
        return;
      }
      // 3. Color Hue cycle
      if (px >= 230 && px <= 326) {
        currentHue = (currentHue + 60) % 360;
        vibrate(12);
        return;
      }
    }

    isDragging = true;
    lastPointer = { x: px, y: py };
    vibrate(8);
  };

  const onPointerMove = (e) => {
    if (!isDragging || !wasmExports) return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    const dx = px - lastPointer.x;
    const dy = py - lastPointer.y;

    // Add angular impulse / torque
    wasmExports.addTeapotTorque(dy * 0.0075, dx * 0.0075);
    lastPointer = { x: px, y: py };
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  return (rawDt) => {
    const { ctx, w, h } = s;
    if (w === 0 || h === 0) return;

    const dt = Math.min(rawDt * 0.016, 0.033);

    if (wasmExports && wasmMemory) {
      wasmExports.updateTeapot(dt);
    }

    ctx.clearRect(0, 0, w, h);

    if (wasmExports && wasmMemory) {
      const vCount = wasmExports.getVertexCount();
      const eCount = wasmExports.getEdgeCount();
      const fCount = wasmExports.getFaceCount ? wasmExports.getFaceCount() : 0;
      const vPtr = wasmExports.getTransformedVertices();
      const ePtr = wasmExports.getEdges();
      const fPtr = wasmExports.getFaces ? wasmExports.getFaces() : null;

      // Float array for 3D coordinates (x, y, z)
      const vData = new Float32Array(wasmMemory.buffer, vPtr, vCount * 3);
      // Int array for edges (v0, v1)
      const eData = new Int32Array(wasmMemory.buffer, ePtr, eCount * 2);
      // Int array for faces (v0, v1, v2, v3)
      const fData = fPtr && fCount > 0 ? new Int32Array(wasmMemory.buffer, fPtr, fCount * 4) : null;

      // Camera projection parameters
      const fov = Math.min(w, h) * 0.44;
      const camZ = 3.8;
      const centerX = w / 2;
      const centerY = h / 2 + 10;

      // Project 3D vertices to 2D screen coordinates
      const proj = [];
      for (let i = 0; i < vCount; i++) {
        const x = vData[i * 3 + 0];
        const y = vData[i * 3 + 1];
        const z = vData[i * 3 + 2];

        const dist = camZ - z;
        const scale = fov / (dist > 0.1 ? dist : 0.1);

        proj.push({
          sx: centerX + x * scale,
          sy: centerY - y * scale, // Invert Y for screen space
          z,
          scale,
        });
      }

      // 1. Draw Filled Shaded Body Polygons (when fillFaces is enabled)
      if (fillFaces && fData && fCount > 0) {
        // Collect and depth-sort visible faces (Painter's algorithm: back to front)
        const sortedFaces = [];
        for (let i = 0; i < fCount; i++) {
          const v0 = fData[i * 4 + 0];
          const v1 = fData[i * 4 + 1];
          const v2 = fData[i * 4 + 2];
          const v3 = fData[i * 4 + 3];

          if (v0 < 0 || v0 >= vCount || v1 < 0 || v1 >= vCount || v2 < 0 || v2 >= vCount) continue;

          const p0 = proj[v0];
          const p1 = proj[v1];
          const p2 = proj[v2];
          const p3 = v3 >= 0 && v3 < vCount ? proj[v3] : null;

          const avgZ = p3 ? (p0.z + p1.z + p2.z + p3.z) * 0.25 : (p0.z + p1.z + p2.z) / 3;
          sortedFaces.push({ v0, v1, v2, v3, p0, p1, p2, p3, avgZ });
        }

        sortedFaces.sort((a, b) => a.avgZ - b.avgZ); // Ascending Z: back faces drawn first

        for (const face of sortedFaces) {
          const { p0, p1, p2, p3, avgZ } = face;
          const depthNorm = Math.max(0.12, Math.min(1.0, (avgZ + 1.6) / 3.2));

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p0.sx, p0.sy);
          ctx.lineTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          if (p3) ctx.lineTo(p3.sx, p3.sy);
          ctx.closePath();

          // Soft translucent illumination fill based on depth
          ctx.fillStyle = `hsla(${currentHue}, 80%, ${Math.round(25 + depthNorm * 35)}%, ${0.18 + depthNorm * 0.38})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. Draw Edges with Depth Shading
      for (let i = 0; i < eCount; i++) {
        const i0 = eData[i * 2 + 0];
        const i1 = eData[i * 2 + 1];
        if (i0 < 0 || i0 >= vCount || i1 < 0 || i1 >= vCount) continue;

        const p0 = proj[i0];
        const p1 = proj[i1];

        // Depth cueing: lines closer to camera appear brighter and crisper
        const avgZ = (p0.z + p1.z) * 0.5;
        const depthNorm = Math.max(0.15, Math.min(1.0, (avgZ + 1.6) / 3.2));

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);

        if (renderMode === 'solid') {
          ctx.strokeStyle = `hsla(${currentHue}, 85%, ${Math.round(28 + depthNorm * 28)}%, ${0.4 + depthNorm * 0.55})`;
          ctx.lineWidth = 1.0 + depthNorm * 1.6;
          if (depthNorm > 0.75) {
            ctx.shadowColor = `hsla(${currentHue}, 90%, 55%, 0.45)`;
            ctx.shadowBlur = 8;
          }
        } else {
          ctx.strokeStyle = `hsla(${currentHue}, 75%, 45%, ${0.3 + depthNorm * 0.5})`;
          ctx.lineWidth = 1.2;
        }

        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Vertices (Illuminated Nodes)
      if (renderMode === 'solid') {
        for (let i = 0; i < vCount; i++) {
          const p = proj[i];
          const depthNorm = Math.max(0.1, Math.min(1.0, (p.z + 1.6) / 3.2));
          if (depthNorm < 0.35) continue; // Skip backfaces for clarity

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 1.5 + depthNorm * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${currentHue}, 95%, ${Math.round(45 + depthNorm * 30)}%, ${depthNorm})`;
          ctx.shadowColor = `hsla(${currentHue}, 95%, 60%, 0.6)`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Top UI Control Bar with 3 Buttons: Wireframe/Shaded, Body Fill, Color Hue
    // 1. Mesh Mode Button
    ctx.save();
    ctx.fillStyle = 'rgba(20, 20, 25, 0.06)';
    ctx.strokeStyle = 'rgba(20, 20, 25, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, 104, 28, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(renderMode === 'solid' ? '● Shaded Mesh' : '○ Wireframe', 66, 28);
    ctx.restore();

    // 2. Body Fill Toggle Button
    ctx.save();
    ctx.fillStyle = fillFaces ? 'rgba(20, 20, 25, 0.10)' : 'rgba(20, 20, 25, 0.04)';
    ctx.strokeStyle = fillFaces ? 'rgba(20, 20, 25, 0.32)' : 'rgba(20, 20, 25, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(126, 14, 96, 28, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fillFaces ? '◼ Body Fill' : '◻ Body Fill', 174, 28);
    ctx.restore();

    // 3. Color Palette Button with current color swatch pip
    ctx.save();
    ctx.fillStyle = 'rgba(20, 20, 25, 0.06)';
    ctx.strokeStyle = 'rgba(20, 20, 25, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(230, 14, 96, 28, 7);
    ctx.fill();
    ctx.stroke();

    // Color indicator pip
    ctx.beginPath();
    ctx.arc(246, 28, 5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${currentHue}, 85%, 45%)`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Color', 282, 28);
    ctx.restore();

    // Helper hint text
    ctx.save();
    ctx.fillStyle = 'rgba(30, 30, 35, 0.55)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Drag & flick to apply angular momentum · Raylib 3D graphics pipeline', w / 2, h - 8);
    ctx.restore();
  };
});
