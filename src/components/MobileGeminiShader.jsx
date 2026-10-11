import { useEffect, useRef } from 'react';

/**
 * MobileGeminiShader
 * High-performance, lightweight pure WebGL 1.0 shader.
 * Simulates organic Gemini AI atmospheric cloud / gas flows
 * along the boundaries and container edges with rich deep-blue,
 * indigo, cyan, and subtle violet-magenta chromatic energy.
 * Pauses automatically when inactive.
 */
export default function MobileGeminiShader({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });

    if (!gl) return;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Multi-octave domain-warped procedural gas shader simulating Gemini AI cloud
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
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
        vec2 p = st * vec2(aspect, 1.0);

        float t = u_time * 0.18;

        // Organic domain-warped clouds swirling and taking container shape
        vec2 q = vec2(fbm(p + vec2(0.0, t * 0.08)),
                      fbm(p + vec2(5.2, 1.3 - t * 0.10)));

        vec2 r = vec2(fbm(p + 3.8 * q + vec2(1.7 - t * 0.12, 9.2 + t * 0.15)),
                      fbm(p + 3.8 * q + vec2(8.3 + t * 0.10, 2.8 - t * 0.12)));

        float f = fbm(p + 3.2 * r);

        // Distance from borders to create fluid edge activity
        vec2 distToEdge = min(st, 1.0 - st);
        float edgeFactor = min(distToEdge.x, distToEdge.y);
        float rimGas = smoothstep(0.0, 0.35, edgeFactor) * (1.0 - smoothstep(0.2, 0.8, edgeFactor));

        // Gemini AI chromatic palette
        vec3 cDark     = vec3(0.03, 0.05, 0.10); // deep night base
        vec3 cIndigo   = vec3(0.08, 0.19, 0.46); // rich indigo
        vec3 cCyan     = vec3(0.12, 0.42, 0.84); // electric cyan-blue
        vec3 cSky      = vec3(0.24, 0.65, 0.98); // vibrant cloud highlights
        vec3 cViolet   = vec3(0.44, 0.16, 0.58); // soft magenta-violet dusk

        vec3 col = mix(cDark, cIndigo, clamp(f * f * 2.4, 0.0, 1.0));
        col = mix(col, cCyan, clamp(length(q) * 0.82, 0.0, 1.0));
        col = mix(col, cSky, clamp(pow(r.x, 2.0) * 0.62, 0.0, 1.0));
        col = mix(col, cViolet, clamp(pow(r.y, 3.0) * 0.42 + rimGas * 0.32, 0.0, 1.0));

        // Enhance clarity in the center so navigation links pop
        float vignette = smoothstep(0.0, 0.18, edgeFactor);
        col *= (0.78 + 0.30 * vignette);

        // Soft frosted translucency
        float alpha = clamp(0.70 + f * 0.22, 0.65, 0.92);

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

    let animId;
    let startTime = performance.now();

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

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
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
        opacity: 0.94,
        zIndex: 0,
      }}
    />
  );
}
