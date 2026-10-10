import { mount } from './util.js';

// Interactive Reaction Diffusion (Gray-Scott model on a high-speed simulation grid)
export const startReactionDiffusion = (canvas) => mount(canvas, (s) => {
  const GW = 140, GH = 90;
  let u = new Float32Array(GW * GH);
  let v = new Float32Array(GW * GH);
  let nextU = new Float32Array(GW * GH);
  let nextV = new Float32Array(GW * GH);

  // Initialize homogeneous field with chemical seeds in the center
  for (let i = 0; i < GW * GH; i++) {
    u[i] = 1.0;
    v[i] = 0.0;
  }
  for (let y = GH * 0.4; y < GH * 0.6; y++) {
    for (let x = GW * 0.4; x < GW * 0.6; x++) {
      const idx = Math.floor(y) * GW + Math.floor(x);
      u[idx] = 0.5 + Math.random() * 0.05;
      v[idx] = 0.25 + Math.random() * 0.05;
    }
  }

  // Offscreen canvas for fast pixel blitting
  const offscreen = document.createElement('canvas');
  offscreen.width = GW;
  offscreen.height = GH;
  const offCtx = offscreen.getContext('2d');
  const imgData = offCtx.createImageData(GW, GH);

  const Du = 0.2097, Dv = 0.105, F = 0.0545, K = 0.062;

  const step = () => {
    for (let y = 1; y < GH - 1; y++) {
      for (let x = 1; x < GW - 1; x++) {
        const i = y * GW + x;
        const curU = u[i], curV = v[i];
        const lapU = (u[i - 1] + u[i + 1] + u[i - GW] + u[i + GW] - 4 * curU) * 0.2;
        const lapV = (v[i - 1] + v[i + 1] + v[i - GW] + v[i + GW] - 4 * curV) * 0.2;
        const uvv = curU * curV * curV;

        nextU[i] = Math.max(0, Math.min(1, curU + (Du * lapU - uvv + F * (1.0 - curU))));
        nextV[i] = Math.max(0, Math.min(1, curV + (Dv * lapV + uvv - (F + K) * curV)));
      }
    }
    const tmpU = u; u = nextU; nextU = tmpU;
    const tmpV = v; v = nextV; nextV = tmpV;
  };

  return () => {
    const { ctx, w, h } = s;

    // Inject chemical V on pointer position gently
    if (s.mx != null && s.my != null && w > 0 && h > 0) {
      const gx = Math.floor((s.mx / w) * GW);
      const gy = Math.floor((s.my / h) * GH);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = gx + dx, ny = gy + dy;
          if (nx >= 1 && nx < GW - 1 && ny >= 1 && ny < GH - 1) {
            v[ny * GW + nx] = 0.55;
            u[ny * GW + nx] = 0.35;
          }
        }
      }
    }

    // Step physics once per frame for calm, deliberate diffusion rate
    step();

    // Render image buffer
    const d = imgData.data;
    for (let i = 0; i < GW * GH; i++) {
      const val = Math.max(0, Math.min(1, u[i] - v[i]));
      const p = i * 4;
      const intensity = Math.floor(val * 240);
      d[p] = intensity;
      d[p + 1] = Math.floor(intensity * 0.96);
      d[p + 2] = Math.floor(intensity * 0.92);
      d[p + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offscreen, 0, 0, w, h);
  };
});
