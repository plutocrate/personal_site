import { useEffect, useRef } from 'react';

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360 / 360;
  if (s === 0) return [l, l, l];
  const hue2rgb = (p, q, t) => {
    let val = t;
    if (val < 0) val += 1;
    if (val > 1) val -= 1;
    if (val < 1 / 6) return p + (q - p) * 6 * val;
    if (val < 1 / 2) return q;
    if (val < 2 / 3) return p + (q - p) * (2 / 3 - val) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
}

function generateMonochromeShades(baseHue) {
  const h = baseHue != null ? baseHue : Math.floor(Math.random() * 360);
  return [
    hslToRgb(h, 0.90, 0.30),
    hslToRgb(h, 0.88, 0.36),
    hslToRgb(h, 0.92, 0.42),
    hslToRgb(h, 0.85, 0.48),
    hslToRgb(h, 0.82, 0.54),
  ];
}

export default function MobileGeminiShader({ active, shakeIntensity = 0 }) {
  const canvasRef = useRef(null);
  const hueRef = useRef(Math.floor(Math.random() * 360));
  const currentColorsRef = useRef(generateMonochromeShades(hueRef.current));
  const targetColorsRef  = useRef(generateMonochromeShades(hueRef.current));
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false,
      stencil: false, powerPreference: 'low-power', premultipliedAlpha: false,
    });
    if (!gl) return;

    hueRef.current = Math.floor(Math.random() * 360);
    const init = generateMonochromeShades(hueRef.current);
    currentColorsRef.current = init;
    targetColorsRef.current  = init;
    let wasShaking = false;

    // ── Vertex shader ────────────────────────────────────────────────────────
    const vsSource = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    // ── Fragment shader ──────────────────────────────────────────────────────
    // Glitch-prevention:
    //  1. u_time is pre-wrapped to [0,1000) in JS → no precision loss over time
    //  2. u_cloud_center is computed in JS via smooth dual-angle drift (doubles)
    //     and sent as a uniform → cloud never jumps or breaks
    //  3. fbm uses small per-octave offsets (not 100) → coords stay bounded
    const fsSource = `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_cloud_center;
      uniform vec3  u_color1;
      uniform vec3  u_color2;
      uniform vec3  u_color3;
      uniform vec3  u_color4;
      uniform vec3  u_color5;
      uniform vec2  u_touch;
      uniform float u_touch_active;
      uniform float u_shake;

      vec3 mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec2 mod289v2(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec3 perm3(vec3 x){ return mod289v3(((x*34.0)+1.0)*x); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p = perm3(perm3(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m*m*m;
        vec3 x  = 2.0*fract(p*C.www) - 1.0;
        vec3 h  = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x *x0.x  + h.x *x0.y;
        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
        return 130.0*dot(m,g);
      }

      // 3-octave fbm — small per-octave offsets keep coords well-bounded
      float fbm3(vec2 p){
        mat2 rot = mat2(0.8660, 0.5, -0.5, 0.8660);
        float v = 0.5*snoise(p);
        p = rot*p*2.1 + vec2(3.17, 1.83); v += 0.25*snoise(p);
        p = rot*p*2.1 + vec2(7.41, 5.29); v += 0.125*snoise(p);
        return v;
      }

      vec3 prism(float t){
        return 0.54 + 0.44*cos(6.28318*(t + vec3(0.0, 0.33, 0.67)));
      }

      void main(){
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pA = vec2(st.x*aspect, st.y);
        float t = u_time;

        // ── Noise warp for cloud body ────────────────────────────────────────
        vec2 q = vec2(fbm3(pA*1.8 + vec2(0.0,   t*0.10)),
                      fbm3(pA*1.8 + vec2(3.71,  -t*0.08)));
        vec2 r = vec2(fbm3(pA*2.1 + 2.6*q + vec2(t*0.09, 0.0)),
                      fbm3(pA*2.1 + 2.6*q + vec2(0.0, t*0.08)));
        float n = fbm3(pA*2.3 + 2.4*r);

        // ── Soft cloud centred on JS-computed position (no glitch ever) ──────
        vec2 cc = vec2(u_cloud_center.x*aspect, u_cloud_center.y);
        float dist   = length(pA - cc);
        float radius = 0.38 + n*0.14;
        float cloud  = smoothstep(radius, 0.02, dist);

        // ── Idle monochrome colour ────────────────────────────────────────────
        vec3 col = mix(u_color1, u_color2, clamp(n*2.0, 0.0, 1.0));
        col = mix(col, u_color3, clamp(length(q)*1.4, 0.0, 1.0));
        col = mix(col, u_color4, clamp(r.x*r.x*1.8,  0.0, 1.0));
        col = mix(col, u_color5, clamp(r.y*r.y*1.8,  0.0, 1.0));

        // ── Touch cut-out ─────────────────────────────────────────────────────
        if(u_touch_active > 0.01){
          vec2 tp  = vec2(u_touch.x*aspect, u_touch.y);
          cloud   *= mix(1.0, smoothstep(0.04, 0.22, length(pA-tp)), u_touch_active);
        }

        // ── Shake: rising 20-colour gas plumes ────────────────────────────────
        float riseT = mod(t*1.9, 1000.0);
        vec2 riseP  = vec2(pA.x, pA.y - riseT);
        vec2 gw = vec2(fbm3(riseP*2.6 + vec2(t*0.5, 0.0)),
                       fbm3(riseP*3.0 + vec2(0.0, t*0.45)));
        float gn = fbm3(riseP*2.0 + gw*2.2);
        float pl1 = smoothstep(0.70, 0.10, abs(fract(pA.x*2.2 + gw.x*0.5 + sin(pA.y*2.7 + t*0.65)) - 0.5));
        float pl2 = smoothstep(0.75, 0.08, abs(fract(pA.x*3.4 - gw.y*0.4 + cos(pA.y*3.3 + t*0.85)) - 0.5));
        float gasDensity = clamp(gn*0.6 + pl1*0.40 + pl2*0.30 + 0.20, 0.0, 1.0);

        float ci  = fract((1.0-st.y)*1.5 + gw.x*1.9 + gw.y*1.5 + gn*3.0 + t*0.26);
        float ci2 = fract(ci + 0.33 + gn*0.40);
        vec3 gasCol = mix(prism(ci), prism(ci2), clamp(gw.y*1.1, 0.0, 1.0));

        // ── Final blend ───────────────────────────────────────────────────────
        float shake = clamp(u_shake*1.1, 0.0, 1.0);
        gl_FragColor = vec4(
          mix(col, gasCol, shake),
          mix(clamp(cloud*0.84, 0.0, 0.90), clamp(gasDensity*0.94, 0.0, 1.0), shake)
        );
      }
    `;

    const mkShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.warn('Shader:', gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    const vs = mkShader(gl.VERTEX_SHADER, vsSource);
    const fs = mkShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(program, vs); gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Link:', gl.getProgramInfoLog(program)); return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(program, 'u_resolution');
    const uTime  = gl.getUniformLocation(program, 'u_time');
    const uCC    = gl.getUniformLocation(program, 'u_cloud_center');
    const uC1    = gl.getUniformLocation(program, 'u_color1');
    const uC2    = gl.getUniformLocation(program, 'u_color2');
    const uC3    = gl.getUniformLocation(program, 'u_color3');
    const uC4    = gl.getUniformLocation(program, 'u_color4');
    const uC5    = gl.getUniformLocation(program, 'u_color5');
    const uTouch = gl.getUniformLocation(program, 'u_touch');
    const uTA    = gl.getUniformLocation(program, 'u_touch_active');
    const uShake = gl.getUniformLocation(program, 'u_shake');

    const onTheme = (e) => {
      const h = e.detail?.hue;
      if (h != null) hueRef.current = h;
      targetColorsRef.current = generateMonochromeShades(hueRef.current);
    };
    window.addEventListener('theme:change', onTheme);

    let animId;
    const t0 = performance.now();

    // ── JS-side cloud drift using dual independent angles (double precision) ──
    // No sin/cos ever reaches large-float territory → zero glitch possible
    let ang1 = Math.random() * Math.PI * 2;
    let ang2 = Math.random() * Math.PI * 2;
    let cx = 0.5, cy = 0.5, tcx = 0.5, tcy = 0.5;

    // Touch state
    let ttx = 0.5, tty = 0.5, tstr = 0.0;
    let ctx2 = 0.5, cty = 0.5, cstr = 0.0;

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      if (r.width && r.height) { ttx = (e.clientX-r.left)/r.width; tty = 1-(e.clientY-r.top)/r.height; tstr = 1.0; }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let cShake = 0.0;
    let colorTimer = 0;   // seconds (increments by dt/60 each frame)
    const COLOR_SEC = 20; // palette shift every 20 real-seconds

    const render = (now) => {
      const elapsed = (now - t0) * 0.001;
      const last    = lastFrameTimeRef.current || now;
      const dt      = Math.min((now - last) / 16.67, 3.0);
      lastFrameTimeRef.current = now;

      // Wrap time to keep GLSL float well-behaved forever
      gl.uniform1f(uTime, elapsed % 1000.0);

      // ── Drift: slow dual-angle lissajous in JS doubles ─────────────────────
      ang1 += 0.0026 * dt;   // ~38s full orbit
      ang2 += 0.0018 * dt;   // ~55s full orbit
      tcx = 0.5 + 0.22 * Math.sin(ang1) + 0.10 * Math.cos(ang2 * 1.4);
      tcy = 0.5 + 0.23 * Math.cos(ang2) + 0.09 * Math.sin(ang1 * 0.75);
      tcx = Math.max(0.18, Math.min(0.82, tcx));
      tcy = Math.max(0.14, Math.min(0.86, tcy));
      cx += (tcx - cx) * 0.012 * dt;   // very slow exponential follow
      cy += (tcy - cy) * 0.012 * dt;
      gl.uniform2f(uCC, cx, cy);

      // ── Colour cycle ────────────────────────────────────────────────────────
      colorTimer += dt / 60.0;
      if (colorTimer >= COLOR_SEC) {
        colorTimer = 0;
        hueRef.current = Math.round((hueRef.current + 60 + Math.random() * 120) % 360);
        targetColorsRef.current = generateMonochromeShades(hueRef.current);
      }
      const ls = 0.016 * dt;
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 3; j++)
          currentColorsRef.current[i][j] += (targetColorsRef.current[i][j] - currentColorsRef.current[i][j]) * ls;
      gl.uniform3f(uC1, ...currentColorsRef.current[0]);
      gl.uniform3f(uC2, ...currentColorsRef.current[1]);
      gl.uniform3f(uC3, ...currentColorsRef.current[2]);
      gl.uniform3f(uC4, ...currentColorsRef.current[3]);
      gl.uniform3f(uC5, ...currentColorsRef.current[4]);

      // ── Touch ─────────────────────────────────────────────────────────────
      ctx2  += (ttx - ctx2) * 0.20; cty  += (tty - cty) * 0.20;
      tstr  *= 0.96; cstr += (tstr - cstr) * 0.20;
      gl.uniform2f(uTouch, ctx2, cty);
      gl.uniform1f(uTA, cstr);

      // ── Shake ─────────────────────────────────────────────────────────────
      if (shakeIntensity > 0.05) {
        cShake += (shakeIntensity - cShake) * 0.22;
        wasShaking = true;
      } else {
        if (wasShaking) {
          wasShaking = false;
          hueRef.current = Math.floor(Math.random() * 360);
          targetColorsRef.current = generateMonochromeShades(hueRef.current);
          colorTimer = 0;
        }
        cShake = Math.max(0.0, cShake - 0.011 * dt);
      }
      gl.uniform1f(uShake, cShake);

      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('theme:change', onTheme);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [active, shakeIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="mobile-gemini-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0,
      }}
    />
  );
}
