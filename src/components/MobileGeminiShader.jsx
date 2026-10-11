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
  return [
    hue2rgb(p, q, h + 1 / 3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1 / 3),
  ];
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
  const targetColorsRef = useRef(generateMonochromeShades(hueRef.current));
  const lastLoopCycleRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      premultipliedAlpha: false,
    });

    if (!gl) return;

    hueRef.current = Math.floor(Math.random() * 360);
    const initialColors = generateMonochromeShades(hueRef.current);
    currentColorsRef.current = initialColors;
    targetColorsRef.current = initialColors;
    lastLoopCycleRef.current = 0;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;
      uniform vec3 u_color5;
      uniform vec2 u_touch;
      uniform float u_touch_active;
      uniform float u_shake;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 4; ++i) {
          v += a * snoise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      // Procedural 20-color prism generator used during vigorous shake!
      vec3 prismRainbow(float t) {
        return 0.54 + 0.44 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2(st.x * aspect, st.y);

        // Shake speed accelerator: shaking causes fast turbulence
        float speedMultiplier = 1.0 + u_shake * 3.8;
        float t = u_time * 0.85 * speedMultiplier;

        // Wandering trajectory across the container
        vec2 cloudCenter = vec2(
          (0.5 + (0.24 + u_shake * 0.15) * sin(t * 0.50) + 0.12 * cos(t * 0.25)) * aspect,
          0.50 + (0.26 + u_shake * 0.15) * cos(t * 0.42) + 0.10 * sin(t * 0.22)
        );

        vec2 offset = p - cloudCenter;
        float d = length(offset);

        // Fractal domain warping with chaotic shake agitation
        vec2 shakeJitter = vec2(
          sin(t * 8.0 + p.y * 12.0),
          cos(t * 8.0 + p.x * 12.0)
        ) * (u_shake * 0.18);

        vec2 q = vec2(fbm(p * (2.2 + u_shake * 1.5) + shakeJitter + vec2(0.0, t * 0.20)),
                      fbm(p * (2.2 + u_shake * 1.5) + shakeJitter + vec2(5.2, 1.2 - t * 0.16)));

        vec2 r = vec2(fbm(p * 2.6 + 3.2 * q + vec2(t * 0.18)),
                      fbm(p * 2.6 + 3.2 * q + vec2(8.4, 2.1 - t * 0.15)));

        float noiseVal = fbm(p * 2.8 + 3.2 * r);

        // Slightly smaller standard cloud radius (~0.38), but when shaken vigorously,
        // it explodes and diffuses completely to take over the container
        float baseRadius = 0.38 + noiseVal * 0.16;
        float shakenRadius = 1.45 + noiseVal * 0.40;
        float cloudRadius = mix(baseRadius, shakenRadius, u_shake);

        // Soft, highly diffused atmospheric edge falloff
        float cloudDensity = smoothstep(cloudRadius, 0.01, d);

        // Interactive touch slice
        if (u_touch_active > 0.01) {
          vec2 touchP = vec2(u_touch.x * aspect, u_touch.y);
          float touchDist = length(p - touchP);
          float cutHole = smoothstep(0.04, 0.24, touchDist);
          cloudDensity *= mix(1.0, cutHole, u_touch_active);
        }

        // Tonal monochromatic blend for standard idle wandering
        vec3 normalCol = mix(u_color1, u_color2, clamp(noiseVal * 2.0, 0.0, 1.0));
        normalCol = mix(normalCol, u_color3, clamp(length(q) * 1.5, 0.0, 1.0));
        normalCol = mix(normalCol, u_color4, clamp(pow(r.x, 2.0) * 1.5, 0.0, 1.0));
        normalCol = mix(normalCol, u_color5, clamp(pow(r.y, 2.0) * 1.5, 0.0, 1.0));

        // 20-color prism chaos when shaken vigorously
        float prismAngle = fract(length(p - vec2(0.5 * aspect, 0.5)) * 4.0 + atan(offset.y, offset.x) * 3.183 + noiseVal * 2.5 + t * 0.5);
        vec3 prismCol = prismRainbow(prismAngle);

        // Interpolate between single-shade cloud and the vibrant 20-color explosion
        vec3 col = mix(normalCol, prismCol, clamp(u_shake * 1.25, 0.0, 1.0));

        // Cloud opacity: highly diffused and dense, expands to full coverage when shaken
        float normalAlpha = clamp(cloudDensity * 0.82, 0.0, 0.92);
        float shakenAlpha = clamp(cloudDensity * 0.98, 0.0, 1.0);
        float alpha = mix(normalAlpha, shakenAlpha, u_shake);

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Shader init error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uColor1 = gl.getUniformLocation(program, 'u_color1');
    const uColor2 = gl.getUniformLocation(program, 'u_color2');
    const uColor3 = gl.getUniformLocation(program, 'u_color3');
    const uColor4 = gl.getUniformLocation(program, 'u_color4');
    const uColor5 = gl.getUniformLocation(program, 'u_color5');
    const uTouch = gl.getUniformLocation(program, 'u_touch');
    const uTouchActive = gl.getUniformLocation(program, 'u_touch_active');
    const uShake = gl.getUniformLocation(program, 'u_shake');

    const handleThemeChange = (e) => {
      const newHue = e.detail?.hue;
      if (newHue != null) hueRef.current = newHue;
      targetColorsRef.current = generateMonochromeShades(hueRef.current);
    };

    window.addEventListener('theme:change', handleThemeChange);

    let animId;
    let startTime = performance.now();

    let targetTouchX = 0.5;
    let targetTouchY = 0.5;
    let touchStrength = 0.0;

    const updateTouch = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targetTouchX = (clientX - rect.left) / rect.width;
        targetTouchY = 1.0 - (clientY - rect.top) / rect.height;
        touchStrength = 1.0;
      }
    };

    const handlePointerMove = (e) => updateTouch(e.clientX, e.clientY);
    const handlePointerDown = (e) => updateTouch(e.clientX, e.clientY);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let currentTouchX = 0.5;
    let currentTouchY = 0.5;
    let currentTouchStrength = 0.0;
    let currentShake = 0.0;

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);

      // Calculate frame delta for smooth, consistent lerping (dt normalized to ~60fps)
      const lastNow = lastFrameTimeRef.current || now;
      const dt = Math.min((now - lastNow) / 16.67, 3.0);
      lastFrameTimeRef.current = now;

      // Check trajectory rotation cycle:
      // In the shader, trajectory is driven by t * 0.50 (where t = elapsed * 0.85).
      // One full circle period = (2 * PI) / (0.85 * 0.50) ≈ 14.78 seconds.
      const currentCycle = Math.floor(elapsed / 14.78);
      if (currentCycle > lastLoopCycleRef.current) {
        lastLoopCycleRef.current = currentCycle;
        // Shift hue organically by 60° to 140° for the new rotation
        hueRef.current = Math.round((hueRef.current + 65 + Math.random() * 80) % 360);
        targetColorsRef.current = generateMonochromeShades(hueRef.current);
      }

      // Silky smooth color lerp: gently blends into the new color shades over ~3-4 seconds (lerp rate ~0.015 per frame)
      const lerpSpeed = 0.018 * dt;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          currentColorsRef.current[i][j] += (targetColorsRef.current[i][j] - currentColorsRef.current[i][j]) * lerpSpeed;
        }
      }

      gl.uniform3f(uColor1, currentColorsRef.current[0][0], currentColorsRef.current[0][1], currentColorsRef.current[0][2]);
      gl.uniform3f(uColor2, currentColorsRef.current[1][0], currentColorsRef.current[1][1], currentColorsRef.current[1][2]);
      gl.uniform3f(uColor3, currentColorsRef.current[2][0], currentColorsRef.current[2][1], currentColorsRef.current[2][2]);
      gl.uniform3f(uColor4, currentColorsRef.current[3][0], currentColorsRef.current[3][1], currentColorsRef.current[3][2]);
      gl.uniform3f(uColor5, currentColorsRef.current[4][0], currentColorsRef.current[4][1], currentColorsRef.current[4][2]);

      // Touch interpolation
      currentTouchX += (targetTouchX - currentTouchX) * 0.20;
      currentTouchY += (targetTouchY - currentTouchY) * 0.20;
      touchStrength *= 0.96;
      currentTouchStrength += (touchStrength - currentTouchStrength) * 0.20;

      gl.uniform2f(uTouch, currentTouchX, currentTouchY);
      gl.uniform1f(uTouchActive, currentTouchStrength);

      // Shake smoothing
      currentShake += (shakeIntensity - currentShake) * 0.16;
      gl.uniform1f(uShake, currentShake);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('theme:change', handleThemeChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, [active, shakeIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="mobile-gemini-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0,
      }}
    />
  );
}
