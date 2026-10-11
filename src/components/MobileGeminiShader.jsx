import { useEffect, useRef } from 'react';

/**
 * Procedural color converter for HSL -> normalized [r, g, b] float tuple
 */
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

/**
 * Generates 5 harmonized, slightly darker yet richly diffused colors
 * distributed evenly around the 360° color wheel based on current or new hue.
 */
function generate5Colors(baseHue) {
  const base = baseHue != null ? baseHue : Math.floor(Math.random() * 360);
  const step = 360 / 5; // 72° spread
  const hues = [
    Math.round((base + 0 * step + (Math.random() - 0.5) * 14 + 360) % 360),
    Math.round((base + 1 * step + (Math.random() - 0.5) * 14 + 360) % 360),
    Math.round((base + 2 * step + (Math.random() - 0.5) * 14 + 360) % 360),
    Math.round((base + 3 * step + (Math.random() - 0.5) * 14 + 360) % 360),
    Math.round((base + 4 * step + (Math.random() - 0.5) * 14 + 360) % 360),
  ];

  // Saturation 88%-95%, Lightness 36%-44% for rich volumetric chromatic ambience
  return [
    hslToRgb(hues[0], 0.92, 0.40),
    hslToRgb(hues[1], 0.88, 0.38),
    hslToRgb(hues[2], 0.90, 0.42),
    hslToRgb(hues[3], 0.86, 0.36),
    hslToRgb(hues[4], 0.94, 0.44),
  ];
}

export default function MobileGeminiShader({ active }) {
  const canvasRef = useRef(null);
  const colorsRef = useRef(generate5Colors());

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

    // Pick a fresh set of 5 colors on mount/open
    colorsRef.current = generate5Colors();

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

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = vec2(st.x * aspect, st.y);

        // Speed boosted significantly (~2.2x faster) so the cloud is lively & active
        float t = u_time * 0.85;

        // Dynamic wandering trajectory across the container
        vec2 cloudCenter = vec2(
          (0.5 + 0.28 * sin(t * 0.52) + 0.14 * cos(t * 0.28)) * aspect,
          0.50 + 0.30 * cos(t * 0.44) + 0.12 * sin(t * 0.24)
        );

        vec2 offset = p - cloudCenter;
        float d = length(offset);

        // Multi-layered domain-warped fractal gas noise
        vec2 q = vec2(fbm(p * 2.0 + vec2(0.0, t * 0.22)),
                      fbm(p * 2.0 + vec2(5.2, 1.2 - t * 0.18)));

        vec2 r = vec2(fbm(p * 2.4 + 3.2 * q + vec2(t * 0.20)),
                      fbm(p * 2.4 + 3.2 * q + vec2(8.4, 2.1 - t * 0.16)));

        float noiseVal = fbm(p * 2.6 + 3.2 * r);

        // Bigger, widely diffused volumetric cloud
        float cloudRadius = 0.65 + noiseVal * 0.25;
        // Soft diffuse falloff: gently dissipates into ambient veil
        float cloudDensity = smoothstep(cloudRadius, 0.02, d);

        // Interactive touch slice / cutting blade
        if (u_touch_active > 0.01) {
          vec2 touchP = vec2(u_touch.x * aspect, u_touch.y);
          float touchDist = length(p - touchP);
          float cutHole = smoothstep(0.04, 0.26, touchDist);
          cloudDensity *= mix(1.0, cutHole, u_touch_active);
        }

        // Blend between 5 distinct, harmonized colors dynamically
        vec3 col = mix(u_color1, u_color2, clamp(noiseVal * 2.0, 0.0, 1.0));
        col = mix(col, u_color3, clamp(length(q) * 1.5, 0.0, 1.0));
        col = mix(col, u_color4, clamp(pow(r.x, 2.0) * 1.6, 0.0, 1.0));
        col = mix(col, u_color5, clamp(pow(r.y, 2.0) * 1.6, 0.0, 1.0));

        // Highly visible, rich diffused opacity
        float alpha = clamp(cloudDensity * 0.88, 0.0, 0.94);

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

    // Immediate update function for colors
    const applyShaderColors = (cList) => {
      gl.uniform3f(uColor1, cList[0][0], cList[0][1], cList[0][2]);
      gl.uniform3f(uColor2, cList[1][0], cList[1][1], cList[1][2]);
      gl.uniform3f(uColor3, cList[2][0], cList[2][1], cList[2][2]);
      gl.uniform3f(uColor4, cList[3][0], cList[3][1], cList[3][2]);
      gl.uniform3f(uColor5, cList[4][0], cList[4][1], cList[4][2]);
    };

    applyShaderColors(colorsRef.current);

    // Listen for theme:change dispatched when logo is tapped -> update cloud colors immediately!
    const handleThemeChange = (e) => {
      const newHue = e.detail?.hue;
      colorsRef.current = generate5Colors(newHue);
      applyShaderColors(colorsRef.current);
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

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);

      currentTouchX += (targetTouchX - currentTouchX) * 0.20;
      currentTouchY += (targetTouchY - currentTouchY) * 0.20;
      touchStrength *= 0.96;
      currentTouchStrength += (touchStrength - currentTouchStrength) * 0.20;

      gl.uniform2f(uTouch, currentTouchX, currentTouchY);
      gl.uniform1f(uTouchActive, currentTouchStrength);

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
  }, [active]);

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
