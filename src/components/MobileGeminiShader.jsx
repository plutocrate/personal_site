import { useEffect, useRef } from 'react';

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360 / 360;
  if (s === 0) return [l, l, l];
  const hue2rgb = (p, q, t) => {
    let v = t;
    if (v < 0) v += 1; if (v > 1) v -= 1;
    if (v < 1/6) return p + (q-p)*6*v;
    if (v < 1/2) return q;
    if (v < 2/3) return p + (q-p)*(2/3-v)*6;
    return p;
  };
  const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
  return [hue2rgb(p,q,h+1/3), hue2rgb(p,q,h), hue2rgb(p,q,h-1/3)];
}

// 5 shades for single monochromatic cloud
function generateMonochromeShades(baseHue) {
  const h = baseHue != null ? baseHue : Math.floor(Math.random()*360);
  return [
    hslToRgb(h, 0.95, 0.38),
    hslToRgb(h, 0.92, 0.45),
    hslToRgb(h, 0.96, 0.52),
    hslToRgb(h, 0.88, 0.58),
    hslToRgb(h, 0.85, 0.64),
  ];
}

// Exactly 4 harmonious complementary/tetradic vibrant colors for reaction stage
function generate4ComplementaryColors(baseHue) {
  const h = baseHue != null ? baseHue : Math.floor(Math.random()*360);
  return [
    hslToRgb(h, 0.95, 0.48),                       // Primary vibrant
    hslToRgb((h + 180) % 360, 0.96, 0.50),          // Direct Complement
    hslToRgb((h + 75) % 360, 0.94, 0.48),           // Triadic / Split +75°
    hslToRgb((h + 255) % 360, 0.96, 0.52),          // Triadic / Split +255°
  ];
}

export default function MobileGeminiShader({ active, shakeIntensity = 0 }) {
  const canvasRef         = useRef(null);
  const hueRef            = useRef(Math.floor(Math.random()*360));
  const currentColorsRef  = useRef(generateMonochromeShades(hueRef.current));
  const targetColorsRef   = useRef(generateMonochromeShades(hueRef.current));
  const reaction4ColorsRef = useRef(generate4ComplementaryColors(hueRef.current));
  const lastFrameTimeRef  = useRef(0);
  const shakeIntensityRef = useRef(shakeIntensity);

  useEffect(() => {
    shakeIntensityRef.current = shakeIntensity;
  }, [shakeIntensity]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha:true, antialias:false, depth:false,
      stencil:false, powerPreference:'low-power', premultipliedAlpha:false,
    });
    if (!gl) return;

    hueRef.current = Math.floor(Math.random()*360);
    const init = generateMonochromeShades(hueRef.current);
    currentColorsRef.current  = init;
    targetColorsRef.current   = init;
    reaction4ColorsRef.current = generate4ComplementaryColors(hueRef.current);
    let wasShaking = false;

    // ── Vertex ──────────────────────────────────────────────────────────────
    const vsSource = `
      attribute vec2 a_pos;
      void main(){ gl_Position = vec4(a_pos,0.0,1.0); }
    `;

    // ── Fragment ─────────────────────────────────────────────────────────────
    const fsSource = `
      precision highp float;
      uniform vec2  u_resolution;
      uniform float u_time;
      uniform vec2  u_cloud_center;
      uniform vec3  u_color1, u_color2, u_color3, u_color4, u_color5;
      uniform vec3  u_chem1, u_chem2, u_chem3, u_chem4; // Exactly 4 complementary colors
      uniform vec2  u_chem_pos1, u_chem_pos2, u_chem_pos3, u_chem_pos4; // 4 dynamic positions
      uniform vec2  u_touch;
      uniform float u_touch_active;
      uniform float u_shake_slosh;  // Stage 1: hitting corner & container boundary
      uniform float u_shake_react;  // Stage 2: chemical reaction 4 complementary clouds
      uniform float u_breathe;
      uniform float u_crack;        // Stage 3: glass cracks & colored gas leak
      uniform float u_crack_seed;

      // ── Simplex noise ───────────────────────────────────────────────────────
      vec3 m289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec2 m289v2(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
      vec3 perm3(vec3 x){ return m289v3(((x*34.0)+1.0)*x); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187,0.366025403784439,
                           -0.577350269189626,0.024390243902439);
        vec2 i  = floor(v+dot(v,C.yy));
        vec2 x0 = v - i + dot(i,C.xx);
        vec2 i1 = (x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
        vec4 x12 = x0.xyxy+C.xxzz; x12.xy-=i1;
        i = m289v2(i);
        vec3 p = perm3(perm3(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
        vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
        m = m*m*m*m;
        vec3 x2 = 2.0*fract(p*C.www)-1.0, h=abs(x2)-0.5, ox=floor(x2+0.5), a0=x2-ox;
        m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
        vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.0*dot(m,g);
      }

      float fbm3(vec2 p){
        mat2 rot = mat2(0.8660,0.5,-0.5,0.8660);
        float v = 0.5*snoise(p);
        p = rot*p*2.1+vec2(3.17,1.83); v += 0.25*snoise(p);
        p = rot*p*2.1+vec2(7.41,5.29); v += 0.125*snoise(p);
        return v;
      }

      void main(){
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pA = vec2(st.x*aspect, st.y);
        float t = u_time;

        // Container boundary proximity
        float distToWallX = min(st.x, 1.0 - st.x);
        float distToWallY = min(st.y, 1.0 - st.y);
        float distToWall  = min(distToWallX, distToWallY);

        // ── STAGE 1: BIG GAS CLOUD INSIDE CONTAINER ───────────────────────────
        // Cloud gets bigger, covers almost screen, but remains diffused at edges.
        // When shaken into walls/corners, the impact point is intensely colorful!
        vec2 sloshWarp = vec2(
          sin(t * 8.0 + pA.y * 4.5) * 0.18,
          cos(t * 6.5 + pA.x * 4.0) * 0.18
        ) * u_shake_slosh;

        vec2 pMain = pA + sloshWarp;
        vec2 q1 = vec2(fbm3(pMain*1.5 + vec2(0.0,  t*(0.08 + u_shake_slosh*0.6))),
                       fbm3(pMain*1.5 + vec2(3.7, -t*(0.07 + u_shake_slosh*0.5))));
        vec2 r1 = vec2(fbm3(pMain*1.8 + 2.5*q1 + vec2(t*0.08, 0.0)),
                       fbm3(pMain*1.8 + 2.5*q1 + vec2(0.0, t*0.07)));
        float n1 = fbm3(pMain*1.9 + 2.2*r1);

        vec2  cc1 = vec2(u_cloud_center.x * aspect, u_cloud_center.y);
        float dist1 = length(pMain - cc1);

        // Natural breath expansion + large coverage when shaking (expands to cover almost screen)
        float breathExp = mix(-0.04, 0.06, u_breathe);
        float bigRadius = (0.55 + breathExp) * (1.0 + u_shake_slosh * 0.48) + n1 * 0.22;
        // Large diffused falloff: edges remain very diffused and soft
        float cloud1 = smoothstep(bigRadius, 0.02, dist1);

        // Wall impact splash: where the cloud hits container boundaries/corners
        float cornerImpact = smoothstep(0.24, 0.01, distToWall) * u_shake_slosh;
        // Point that hits the wall becomes very rich & saturated
        float impactIntensity = cornerImpact * (0.6 + 0.4*n1);
        cloud1 = clamp(cloud1 + impactIntensity * 0.65, 0.0, 1.0);

        // Deep rich coloration for main cloud
        vec3 baseCol = mix(u_color1, u_color2, clamp(n1*2.0, 0.0, 1.0));
        baseCol = mix(baseCol, u_color3, clamp(length(q1)*1.5, 0.0, 1.0));
        baseCol = mix(baseCol, u_color4, clamp(r1.x*r1.x*1.8, 0.0, 1.0));
        baseCol = mix(baseCol, u_color5, clamp(r1.y*r1.y*1.8, 0.0, 1.0));
        // Corner/wall impact is intensely colorful (saturation burst)
        vec3 impactColor = mix(u_color1 * 1.35, u_color3 * 1.5, n1);
        baseCol = mix(baseCol, impactColor, impactIntensity * 0.85);

        // ── STAGE 2: CHEMICAL REACTION (4 COMPLEMENTARY CLOUDS POP & MIX) ────
        // 4 distinct complementary colored clouds swirling and colliding vigorously
        vec2 swirl = vec2(
          fbm3(pA*2.2 + vec2(t*1.6, -t*1.2)),
          fbm3(pA*2.2 + vec2(-t*1.4, t*1.5))
        ) * 0.28 * u_shake_react;

        vec2 pChem = pA + swirl;

        // Cloud 1
        vec2 c1 = vec2(u_chem_pos1.x*aspect, u_chem_pos1.y);
        float d1 = length(pChem - c1);
        float nC1 = fbm3(pChem*2.4 + vec2(t*0.9, 0.0));
        float cl1 = smoothstep(0.48 + nC1*0.20, 0.04, d1);

        // Cloud 2
        vec2 c2 = vec2(u_chem_pos2.x*aspect, u_chem_pos2.y);
        float d2 = length(pChem - c2);
        float nC2 = fbm3(pChem*2.4 + vec2(0.0, t*0.85));
        float cl2 = smoothstep(0.48 + nC2*0.20, 0.04, d2);

        // Cloud 3
        vec2 c3 = vec2(u_chem_pos3.x*aspect, u_chem_pos3.y);
        float d3 = length(pChem - c3);
        float nC3 = fbm3(pChem*2.4 + vec2(-t*0.8, t*0.7));
        float cl3 = smoothstep(0.46 + nC3*0.20, 0.04, d3);

        // Cloud 4
        vec2 c4 = vec2(u_chem_pos4.x*aspect, u_chem_pos4.y);
        float d4 = length(pChem - c4);
        float nC4 = fbm3(pChem*2.4 + vec2(t*0.75, -t*0.9));
        float cl4 = smoothstep(0.46 + nC4*0.20, 0.04, d4);

        // Overlapping collision zones between the 4 clouds (turbulent mixing)
        float coll = (cl1*cl2 + cl2*cl3 + cl3*cl4 + cl4*cl1 + cl1*cl3 + cl2*cl4);
        float totalChemDensity = clamp(cl1 + cl2 + cl3 + cl4 + coll*0.75, 0.0, 1.0);

        // Highly saturated mixing: each cloud contributes its vibrant complementary hue
        vec3 chemColor = u_chem1 * cl1 + u_chem2 * cl2 + u_chem3 * cl3 + u_chem4 * cl4;
        // Collision mixing cores: luminous mixing reaction
        chemColor += (u_chem1 + u_chem2 + u_chem3 + u_chem4) * 0.25 * coll;
        chemColor = clamp(chemColor, 0.0, 1.0);

        // ── BLEND STAGE 1 (MAIN) ↔ STAGE 2 (4 COMPLEMENTARY CHEMICAL REACTION) ──
        float reactFactor = clamp(u_shake_react * 1.15, 0.0, 1.0);
        vec3  activeColor   = mix(baseCol, chemColor, reactFactor);
        float activeDensity = mix(cloud1, totalChemDensity, reactFactor);

        // Touch cut-out
        if(u_touch_active > 0.01){
          vec2 tp = vec2(u_touch.x*aspect, u_touch.y);
          activeDensity *= mix(1.0, smoothstep(0.04, 0.22, length(pA - tp)), u_touch_active);
        }

        // Base opacity: vibrant & well-diffused
        float breathA = mix(0.85, 0.95, u_breathe);
        float outAlpha = clamp(activeDensity * breathA, 0.0, 0.96);
        vec3  outRGB   = activeColor;

        // ── STAGE 3: REALISTIC CRACKS & GAS LEAK ──────────────────────────────
        if(u_crack > 0.005){
          float lineW = 0.055 * u_crack;
          float glowW = 0.36  * u_crack;
          float maxR  = 0.58  * u_crack;

          vec2 o1 = vec2(mix(0.20, 0.45, fract(u_crack_seed * 7.13)) * aspect,
                         mix(0.30, 0.70, fract(u_crack_seed * 3.57)));
          vec2 o2 = vec2(mix(0.55, 0.80, fract(u_crack_seed * 5.89)) * aspect,
                         mix(0.25, 0.65, fract(u_crack_seed * 9.41)));

          // Crack 1
          vec2 dO1 = pA - o1; float rO1 = length(dO1);
          vec2 nd1 = dO1 / max(rO1, 0.001);
          vec2 ck1 = vec2(nd1.x*2.6 + nd1.y*1.6, rO1*7.2) + vec2(u_crack_seed*11.3, u_crack_seed*7.9);
          float n1a = snoise(ck1);
          float n1b = snoise(ck1*2.0 + vec2(3.1, 2.7));
          float mk1 = smoothstep(maxR, maxR*0.04, rO1);

          float crack1 = max(smoothstep(lineW, 0.0, abs(n1a)), smoothstep(lineW*0.85, 0.0, abs(n1b))*0.70) * mk1;
          float glow1  = max(smoothstep(glowW, lineW*1.5, abs(n1a)), smoothstep(glowW*0.80, lineW*1.2, abs(n1b))*0.65) * mk1;

          // Crack 2
          vec2 dO2 = pA - o2; float rO2 = length(dO2);
          vec2 nd2 = dO2 / max(rO2, 0.001);
          vec2 ck2 = vec2(nd2.x*2.3 + nd2.y*1.9, rO2*6.8) + vec2(u_crack_seed*17.7, u_crack_seed*13.1);
          float n2a = snoise(ck2);
          float n2b = snoise(ck2*2.1 + vec2(5.3, 1.9));
          float mk2 = smoothstep(maxR*0.82, maxR*0.04, rO2);

          float crack2 = max(smoothstep(lineW, 0.0, abs(n2a)), smoothstep(lineW*0.80, 0.0, abs(n2b))*0.65) * mk2 * 0.85;
          float glow2  = max(smoothstep(glowW*0.90, lineW*1.3, abs(n2a)), smoothstep(glowW*0.70, lineW, abs(n2b))*0.60) * mk2 * 0.80;

          float crackAmt = clamp(max(crack1, crack2), 0.0, 1.0);
          float glowAmt  = clamp(max(glow1, glow2) * 0.95, 0.0, 0.92);

          // Leaking gas adopts one of the vibrant complementary colors
          vec3 leakGas = mix(u_chem1, u_chem2, 0.5 + 0.5*sin(t*2.0 + rO1*5.0));

          outRGB   = mix(outRGB, leakGas, glowAmt * 0.88);
          outRGB   = mix(outRGB, vec3(0.02, 0.01, 0.03), crackAmt * 0.96);
          outAlpha = clamp(mix(outAlpha, 0.96, glowAmt * 0.6) * (1.0 - crackAmt * 0.12) + crackAmt * 0.95, 0.0, 1.0);
        }

        gl_FragColor = vec4(outRGB, outAlpha);
      }
    `;

    const mkS = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s,src); gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))
        console.warn('Shader:',gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    const vs = mkS(gl.VERTEX_SHADER, vsSource);
    const fs = mkS(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(program,vs); gl.attachShader(program,fs);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
      console.warn('Link:',gl.getProgramInfoLog(program)); return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program,'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

    const uRes         = gl.getUniformLocation(program,'u_resolution');
    const uTime        = gl.getUniformLocation(program,'u_time');
    const uCC          = gl.getUniformLocation(program,'u_cloud_center');
    const uC1          = gl.getUniformLocation(program,'u_color1');
    const uC2          = gl.getUniformLocation(program,'u_color2');
    const uC3          = gl.getUniformLocation(program,'u_color3');
    const uC4          = gl.getUniformLocation(program,'u_color4');
    const uC5          = gl.getUniformLocation(program,'u_color5');
    const uChem1       = gl.getUniformLocation(program,'u_chem1');
    const uChem2       = gl.getUniformLocation(program,'u_chem2');
    const uChem3       = gl.getUniformLocation(program,'u_chem3');
    const uChem4       = gl.getUniformLocation(program,'u_chem4');
    const uChemPos1    = gl.getUniformLocation(program,'u_chem_pos1');
    const uChemPos2    = gl.getUniformLocation(program,'u_chem_pos2');
    const uChemPos3    = gl.getUniformLocation(program,'u_chem_pos3');
    const uChemPos4    = gl.getUniformLocation(program,'u_chem_pos4');
    const uTouch       = gl.getUniformLocation(program,'u_touch');
    const uTA          = gl.getUniformLocation(program,'u_touch_active');
    const uShakeSlosh  = gl.getUniformLocation(program,'u_shake_slosh');
    const uShakeReact  = gl.getUniformLocation(program,'u_shake_react');
    const uBreathe     = gl.getUniformLocation(program,'u_breathe');
    const uCrack       = gl.getUniformLocation(program,'u_crack');
    const uCrackSeed   = gl.getUniformLocation(program,'u_crack_seed');

    const onTheme = (e) => {
      const h = e.detail?.hue;
      if(h!=null) hueRef.current = h;
      targetColorsRef.current = generateMonochromeShades(hueRef.current);
      reaction4ColorsRef.current = generate4ComplementaryColors(hueRef.current);
    };
    window.addEventListener('theme:change', onTheme);

    let animId;
    const t0 = performance.now();

    // Natural wandering angles
    let ang1 = Math.random()*Math.PI*2;
    let ang2 = Math.random()*Math.PI*2;
    let cx = 0.5 + 0.20*Math.sin(ang1) + 0.08*Math.cos(ang2*1.3);
    let cy = 0.5 + 0.21*Math.cos(ang2) + 0.07*Math.sin(ang1*0.78);

    // 4 Complementary reaction cloud positions
    let p1x=0.25, p1y=0.30, p2x=0.75, p2y=0.70, p3x=0.75, p3y=0.30, p4x=0.25, p4y=0.70;

    // Touch
    let ttx=0.5, tty=0.5, tstr=0.0, ctx2=0.5, cty=0.5, cstr=0.0;
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if(rect.width&&rect.height){
        ttx=(e.clientX-rect.left)/rect.width;
        tty=1-(e.clientY-rect.top)/rect.height;
        tstr=1.0;
      }
    };
    window.addEventListener('pointermove',onMove,{passive:true});
    window.addEventListener('pointerdown',onMove,{passive:true});

    const resize = () => {
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const w=canvas.clientWidth, h=canvas.clientHeight;
      if(!w||!h) return;
      canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uRes,canvas.width,canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Timeline states
    let sustainedShakeTimer = 0.0;
    let cShakeSlosh = 0.0; // Stage 1: hitting walls & corner
    let cShakeReact = 0.0; // Stage 2: 4 complementary reaction clouds
    let crackLevel  = 0.0; // Stage 3: glass cracks
    let crackSeed   = Math.random();
    let colorTimer  = 0.0;
    const COLOR_SEC = 4;

    const render = (now) => {
      const elapsed = (now - t0)*0.001;
      const last    = lastFrameTimeRef.current || now;
      const rawDt   = (now-last)/1000.0;
      const dt      = Math.min(rawDt*60, 3.0);
      lastFrameTimeRef.current = now;

      gl.uniform1f(uTime, elapsed % 1000.0);

      // ── Drift: natural breathing wandering ─────────────────────────────────
      ang1 += (Math.PI*2/12)*rawDt;
      ang2 += (Math.PI*2/17)*rawDt;

      let targetCX = 0.5 + 0.20*Math.sin(ang1) + 0.08*Math.cos(ang2*1.3);
      let targetCY = 0.5 + 0.21*Math.cos(ang2) + 0.07*Math.sin(ang1*0.78);

      // When shaking starts, gas cloud violently hits corner/walls
      if(cShakeSlosh > 0.01){
        // Drives gas cloud deep into corners and walls
        const cornerX = Math.sin(elapsed * 7.5) * 0.42 * cShakeSlosh;
        const cornerY = Math.cos(elapsed * 6.2) * 0.44 * cShakeSlosh;
        targetCX += cornerX;
        targetCY += cornerY;
      }
      cx = Math.max(0.04, Math.min(0.96, targetCX));
      cy = Math.max(0.04, Math.min(0.96, targetCY));
      gl.uniform2f(uCC, cx, cy);

      // 4 Dynamic reaction cloud positions swirling inside container
      p1x = 0.5 + 0.35 * Math.sin(elapsed * 4.2);
      p1y = 0.5 + 0.35 * Math.cos(elapsed * 3.8);
      p2x = 0.5 + 0.36 * Math.sin(elapsed * 3.9 + 1.8);
      p2y = 0.5 + 0.36 * Math.cos(elapsed * 4.4 + 2.1);
      p3x = 0.5 + 0.38 * Math.cos(elapsed * 4.5 + 3.5);
      p3y = 0.5 + 0.34 * Math.sin(elapsed * 3.6 + 3.2);
      p4x = 0.5 + 0.34 * Math.sin(elapsed * 4.8 + 4.8);
      p4y = 0.5 + 0.38 * Math.cos(elapsed * 4.1 + 5.0);

      gl.uniform2f(uChemPos1, p1x, p1y);
      gl.uniform2f(uChemPos2, p2x, p2y);
      gl.uniform2f(uChemPos3, p3x, p3y);
      gl.uniform2f(uChemPos4, p4x, p4y);

      // ── Breathing pulse (4.5s cycle) ─────────────────────────────────────
      gl.uniform1f(uBreathe, (Math.sin((elapsed*Math.PI*2)/4.5)+1.0)*0.5);

      // ── Palette cycle ──────────────────────────────────────────────────────
      colorTimer += rawDt;
      if(colorTimer >= COLOR_SEC){
        colorTimer = 0;
        hueRef.current = Math.round((hueRef.current + 60 + Math.random()*120) % 360);
        targetColorsRef.current   = generateMonochromeShades(hueRef.current);
        reaction4ColorsRef.current = generate4ComplementaryColors(hueRef.current);
      }
      const ls = 0.018*dt;
      for(let i=0;i<5;i++)
        for(let j=0;j<3;j++)
          currentColorsRef.current[i][j] += (targetColorsRef.current[i][j]-currentColorsRef.current[i][j])*ls;

      gl.uniform3f(uC1,...currentColorsRef.current[0]);
      gl.uniform3f(uC2,...currentColorsRef.current[1]);
      gl.uniform3f(uC3,...currentColorsRef.current[2]);
      gl.uniform3f(uC4,...currentColorsRef.current[3]);
      gl.uniform3f(uC5,...currentColorsRef.current[4]);

      // 4 Complementary colors
      gl.uniform3f(uChem1, ...reaction4ColorsRef.current[0]);
      gl.uniform3f(uChem2, ...reaction4ColorsRef.current[1]);
      gl.uniform3f(uChem3, ...reaction4ColorsRef.current[2]);
      gl.uniform3f(uChem4, ...reaction4ColorsRef.current[3]);

      // ── Touch ─────────────────────────────────────────────────────────────
      ctx2 +=(ttx-ctx2)*0.20; cty +=(tty-cty)*0.20;
      tstr*=0.96; cstr+=(tstr-cstr)*0.20;
      gl.uniform2f(uTouch,ctx2,cty);
      gl.uniform1f(uTA,cstr);

      // ── TIMELINE: Start at 0.6s ───────────────────────────────────────────
      //  - 0.0s – 0.6s: Casual movement ignored
      //  - 0.6s – 1.8s: Stage 1: Big cloud expands, hits corners & walls (outer remains diffused, impact point is very colorful)
      //  - 1.8s – 3.2s: Stage 2: Chemical reaction! 4 complementary clouds pop and mix like hell
      //  - > 3.2s:      Stage 3: Realistic glass cracks & gas leak
      //  - Shake stop: Smooth lerped retrieval back to calm single cloud
      const isShakingNow = (shakeIntensityRef.current > 0.05);

      if(isShakingNow){
        sustainedShakeTimer += rawDt;
        wasShaking = true;

        if(sustainedShakeTimer < 0.6){
          // Grace period
          cShakeSlosh = Math.max(0.0, cShakeSlosh - rawDt * 1.5);
          cShakeReact = Math.max(0.0, cShakeReact - rawDt * 1.5);
        } else if(sustainedShakeTimer < 1.8){
          // Stage 1 (0.6s - 1.8s): Big cloud hitting corners/walls
          const progress = (sustainedShakeTimer - 0.6) / 1.2;
          cShakeSlosh += (Math.min(1.0, progress * 1.25) - cShakeSlosh) * 0.16 * dt;
          cShakeReact  = Math.max(0.0, cShakeReact - rawDt * 1.2);
        } else if(sustainedShakeTimer < 3.2){
          // Stage 2 (1.8s - 3.2s): Chemical reaction pops 4 complementary clouds
          cShakeSlosh = 1.0;
          const progress = (sustainedShakeTimer - 1.8) / 1.4;
          cShakeReact += (Math.min(1.0, progress * 1.2) - cShakeReact) * 0.18 * dt;
        } else {
          // Stage 3 (> 3.2s): Cracks & leaking gas
          cShakeSlosh = 1.0;
          cShakeReact = 1.0;
          crackLevel  = Math.min(1.0, crackLevel + rawDt * 0.70);
        }
      } else {
        // Shaking stopped: natural lerped retrieval
        if(wasShaking && sustainedShakeTimer >= 0.6){
          hueRef.current = Math.floor(Math.random()*360);
          targetColorsRef.current    = generateMonochromeShades(hueRef.current);
          reaction4ColorsRef.current = generate4ComplementaryColors(hueRef.current);
          colorTimer = 0;
        }
        wasShaking = false;
        sustainedShakeTimer = 0.0;

        // Healing sequence:
        crackLevel  = Math.max(0.0, crackLevel  - rawDt * 0.36);
        if(crackLevel < 0.01) crackSeed = Math.random();

        cShakeReact = Math.max(0.0, cShakeReact - rawDt * 0.48);
        cShakeSlosh = Math.max(0.0, cShakeSlosh - rawDt * 0.52);
      }

      gl.uniform1f(uShakeSlosh, cShakeSlosh);
      gl.uniform1f(uShakeReact, cShakeReact);
      gl.uniform1f(uCrack,      crackLevel);
      gl.uniform1f(uCrackSeed,  crackSeed);

      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES,0,6);
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
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="mobile-gemini-canvas"
      aria-hidden="true"
      style={{
        position:'absolute', inset:0,
        width:'100%', height:'100%',
        pointerEvents:'none',
        borderRadius:'inherit',
        zIndex:0,
      }}
    />
  );
}
