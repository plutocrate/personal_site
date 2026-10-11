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

function generateMonochromeShades(baseHue) {
  const h = baseHue != null ? baseHue : Math.floor(Math.random()*360);
  return [
    hslToRgb(h, 0.90, 0.30), hslToRgb(h, 0.88, 0.36),
    hslToRgb(h, 0.92, 0.42), hslToRgb(h, 0.85, 0.48),
    hslToRgb(h, 0.82, 0.54),
  ];
}

export default function MobileGeminiShader({ active, shakeIntensity = 0 }) {
  const canvasRef        = useRef(null);
  const hueRef           = useRef(Math.floor(Math.random()*360));
  const currentColorsRef = useRef(generateMonochromeShades(hueRef.current));
  const targetColorsRef  = useRef(generateMonochromeShades(hueRef.current));
  const lastFrameTimeRef = useRef(0);
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
    currentColorsRef.current = init;
    targetColorsRef.current  = init;
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
      uniform vec2  u_touch;
      uniform float u_touch_active;
      uniform float u_shake_slosh;  // Stage 1: violent wall bounce / turbulence of normal gas
      uniform float u_shake;        // Stage 2: 20-color vigorous gas explosion
      uniform float u_breathe;
      uniform float u_crack;        // Stage 3: glass cracks & leaking gas
      uniform float u_crack_seed;   // random float, stable per crack event

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

      // 3-octave fbm with bounded offsets
      float fbm3(vec2 p){
        mat2 rot = mat2(0.8660,0.5,-0.5,0.8660);
        float v = 0.5*snoise(p);
        p = rot*p*2.1+vec2(3.17,1.83); v += 0.25*snoise(p);
        p = rot*p*2.1+vec2(7.41,5.29); v += 0.125*snoise(p);
        return v;
      }

      // Full-saturation spectrum (0.5+0.5*cos = 0…1 per channel = max vivid)
      vec3 vibrant(float t){
        return 0.5 + 0.5*cos(6.28318*(t + vec3(0.0,0.33,0.67)));
      }

      void main(){
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 pA = vec2(st.x*aspect, st.y);
        float t = u_time;

        // Wall impact splash / shockwaves when normal gas hits container boundaries
        float distToWallX = min(st.x, 1.0 - st.x);
        float distToWallY = min(st.y, 1.0 - st.y);
        float distToBoundary = min(distToWallX, distToWallY);
        float wallImpact = smoothstep(0.18, 0.01, distToBoundary) * u_shake_slosh;

        // ── Normal Cloud with Violent Sloshing/Wall Hits ──────────────────────────
        // Sloshing warps the space aggressively towards the walls when shaken
        vec2 sloshWarp = vec2(
          sin(t * 8.5 + pA.y * 6.0) * 0.15,
          cos(t * 7.2 + pA.x * 5.0) * 0.15
        ) * u_shake_slosh;

        vec2 pNormal = pA + sloshWarp;
        vec2 q = vec2(fbm3(pNormal*1.8 + vec2(0.0,  t*(0.10 + u_shake_slosh*0.8))),
                      fbm3(pNormal*1.8 + vec2(3.71, -t*(0.08 + u_shake_slosh*0.7))));
        vec2 r = vec2(fbm3(pNormal*2.1 + 2.6*q + vec2(t*0.09, 0.0)),
                      fbm3(pNormal*2.1 + 2.6*q + vec2(0.0, t*0.08)));
        float n = fbm3(pNormal*2.3 + 2.4*r);

        vec2 cc = vec2(u_cloud_center.x*aspect, u_cloud_center.y);
        float dist = length(pNormal - cc);
        float breathExpand = mix(-0.03, 0.05, u_breathe);
        // During slosh, cloud expands & splashes outward towards edges
        float radius = (0.36 + breathExpand) * (1.0 + u_shake_slosh * 0.45) + n * (0.13 + u_shake_slosh * 0.15);
        float cloud  = smoothstep(radius, 0.02, dist);

        // Add wall boundary splash density
        cloud = clamp(cloud + wallImpact * 0.55 * (0.5 + 0.5*n), 0.0, 1.0);

        vec3 col = mix(u_color1, u_color2, clamp(n*2.0, 0.0, 1.0));
        col = mix(col, u_color3, clamp(length(q)*1.4, 0.0, 1.0));
        col = mix(col, u_color4, clamp(r.x*r.x*1.8, 0.0, 1.0));
        col = mix(col, u_color5, clamp(r.y*r.y*1.8, 0.0, 1.0));
        // Wall impact splash glow
        col += vec3(0.18, 0.18, 0.22) * wallImpact;

        if(u_touch_active > 0.01){
          vec2 tp = vec2(u_touch.x*aspect, u_touch.y);
          cloud *= mix(1.0, smoothstep(0.04, 0.22, length(pA - tp)), u_touch_active);
        }

        // ── Stage 2: Multi-Gas Colliding, Vigorous 20-Color Plumes ──────────────
        float riseSpeed = 2.4 + u_shake * 1.6;
        float riseT = mod(t * riseSpeed, 1000.0);
        vec2 riseP  = vec2(pA.x, pA.y - riseT);
        vec2 gw = vec2(fbm3(riseP*2.6 + vec2(t*0.70, 0.0)),
                       fbm3(riseP*3.0 + vec2(0.0, t*0.65)));
        float gn = fbm3(riseP*2.0 + gw*2.4);

        // Multiple distinct plume streams crashing horizontally & vertically
        float pl1 = smoothstep(0.68, 0.05, abs(fract(pA.x*2.2 + gw.x*0.65 + sin(pA.y*3.2 + t*1.2)) - 0.5));
        float pl2 = smoothstep(0.70, 0.06, abs(fract(pA.x*3.4 - gw.y*0.55 + cos(pA.y*3.8 + t*1.5)) - 0.5));
        float pl3 = smoothstep(0.64, 0.06, abs(fract(pA.x*1.7 + gw.x*0.45 - sin(pA.y*2.4 + t*0.9)) - 0.5));
        float pl4 = smoothstep(0.66, 0.05, abs(fract(pA.y*2.6 + gw.y*0.50 + cos(pA.x*2.8 + t*1.1)) - 0.5));

        // High collision mixing zones
        float coll12 = pl1 * pl2;
        float coll23 = pl2 * pl3;
        float coll13 = pl1 * pl3;
        float collAll = max(max(coll12, coll23), max(coll13, pl1*pl4));

        float gasDensity = clamp(
          gn * 0.42 + pl1 * 0.35 + pl2 * 0.32 + pl3 * 0.28 + pl4 * 0.26
          + (coll12 + coll23 + coll13) * 0.65 + 0.15,
          0.0, 1.0
        );

        // 20-color saturated spectrum distributed across colliding streams
        float ci1 = fract((1.0 - st.y) * 1.6 + gw.x * 2.0 + gn * 3.2 + t * 0.35);
        float ci2 = fract(ci1 + 0.35 + gw.y * 0.45);
        float ci3 = fract(ci1 + 0.68 + gn * 0.35);
        float ci4 = fract(ci1 + 0.88 + pl4 * 0.5);

        vec3 gasCol  = vibrant(ci1) * max(pl1, (coll12 + coll13) * 0.45);
        gasCol      += vibrant(ci2) * max(pl2, (coll12 + coll23) * 0.45);
        gasCol      += vibrant(ci3) * max(pl3, (coll23 + coll13) * 0.45);
        gasCol      += vibrant(ci4) * max(pl4, collAll * 0.5);
        // Mixing burst: hot luminous mixing cores
        gasCol      += vec3(1.0, 0.98, 0.95) * collAll * 0.75;
        gasCol       = clamp(gasCol * 0.68, 0.0, 1.0);
        gasCol       = mix(gasCol, vibrant(fract(ci1 + 0.2)), clamp(gn * 0.32, 0.0, 0.4));

        // ── Normal ↔ Vigorous Blend ─────────────────────────────────────────────
        float shakeFactor = clamp(u_shake * 1.15, 0.0, 1.0);
        float breathA     = mix(0.76, 0.88, u_breathe);
        float idleAlpha   = clamp(cloud * breathA, 0.0, 0.92);
        vec3  baseRGB     = mix(col, gasCol, shakeFactor);
        float baseAlpha   = mix(idleAlpha, clamp(gasDensity * 0.95, 0.0, 1.0), shakeFactor);

        // ── Stage 3: Realistic Glass Cracks with Colored Gas Leaking ───────────
        float crackAmt = 0.0, glowAmt = 0.0;
        vec3  leakCol  = vibrant(fract(u_crack_seed * 4.3));

        if(u_crack > 0.005){
          float lineW = 0.055 * u_crack;
          float glowW = 0.34  * u_crack;
          float maxR  = 0.55  * u_crack;

          // Origin 1
          vec2 o1 = vec2(mix(0.20, 0.45, fract(u_crack_seed * 7.13)) * aspect,
                         mix(0.30, 0.70, fract(u_crack_seed * 3.57)));
          // Origin 2
          vec2 o2 = vec2(mix(0.55, 0.80, fract(u_crack_seed * 5.89)) * aspect,
                         mix(0.25, 0.65, fract(u_crack_seed * 9.41)));

          // Crack 1
          vec2 d1  = pA - o1;
          float r1 = length(d1);
          vec2 nd1 = d1 / max(r1, 0.001);
          vec2 ck1 = vec2(nd1.x * 2.6 + nd1.y * 1.6, r1 * 7.2)
                   + vec2(u_crack_seed * 11.3, u_crack_seed * 7.9);
          float n1a = snoise(ck1);
          float n1b = snoise(ck1 * 2.0 + vec2(3.1, 2.7));
          float mk1 = smoothstep(maxR, maxR * 0.04, r1);
          crackAmt = max(crackAmt,
            max(smoothstep(lineW, 0.0, abs(n1a)),
                smoothstep(lineW * 0.85, 0.0, abs(n1b)) * 0.70) * mk1);
          glowAmt = max(glowAmt,
            max(smoothstep(glowW, lineW * 1.5, abs(n1a)),
                smoothstep(glowW * 0.80, lineW * 1.2, abs(n1b)) * 0.65) * mk1);
          leakCol = vibrant(fract(u_crack_seed * 4.3 + abs(n1a) * 0.7 + r1 * 0.4));

          // Crack 2
          vec2 d2  = pA - o2;
          float r2 = length(d2);
          vec2 nd2 = d2 / max(r2, 0.001);
          vec2 ck2 = vec2(nd2.x * 2.3 + nd2.y * 1.9, r2 * 6.8)
                   + vec2(u_crack_seed * 17.7, u_crack_seed * 13.1);
          float n2a = snoise(ck2);
          float n2b = snoise(ck2 * 2.1 + vec2(5.3, 1.9));
          float mk2 = smoothstep(maxR * 0.82, maxR * 0.04, r2);
          crackAmt = max(crackAmt,
            max(smoothstep(lineW, 0.0, abs(n2a)),
                smoothstep(lineW * 0.80, 0.0, abs(n2b)) * 0.65) * mk2 * 0.85);
          glowAmt = max(glowAmt,
            max(smoothstep(glowW * 0.90, lineW * 1.3, abs(n2a)),
                smoothstep(glowW * 0.70, lineW, abs(n2b)) * 0.60) * mk2 * 0.80);
        }

        crackAmt = clamp(crackAmt, 0.0, 1.0);
        glowAmt  = clamp(glowAmt * 0.90, 0.0, 0.88);

        // Compose: leaking gas glow emits from cracks, glass fracture edge is dark & sharp
        vec3 outRGB = mix(baseRGB, leakCol, glowAmt * 0.85);
        outRGB = mix(outRGB, vec3(0.02, 0.01, 0.03), crackAmt * 0.96);
        float outAlpha = clamp(
          mix(baseAlpha, 0.90, glowAmt * 0.6) * (1.0 - crackAmt * 0.15)
          + crackAmt * 0.94,
          0.0, 1.0
        );

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
    const uTouch       = gl.getUniformLocation(program,'u_touch');
    const uTA          = gl.getUniformLocation(program,'u_touch_active');
    const uShakeSlosh  = gl.getUniformLocation(program,'u_shake_slosh');
    const uShake       = gl.getUniformLocation(program,'u_shake');
    const uBreathe     = gl.getUniformLocation(program,'u_breathe');
    const uCrack       = gl.getUniformLocation(program,'u_crack');
    const uCrackSeed   = gl.getUniformLocation(program,'u_crack_seed');

    const onTheme = (e) => {
      const h = e.detail?.hue;
      if(h!=null) hueRef.current = h;
      targetColorsRef.current = generateMonochromeShades(hueRef.current);
    };
    window.addEventListener('theme:change', onTheme);

    let animId;
    const t0 = performance.now();

    // JS-side cloud drift (dual independent angles, double precision)
    let ang1 = Math.random()*Math.PI*2;
    let ang2 = Math.random()*Math.PI*2;
    let cx = 0.5 + 0.20*Math.sin(ang1) + 0.08*Math.cos(ang2*1.3);
    let cy = 0.5 + 0.21*Math.cos(ang2) + 0.07*Math.sin(ang1*0.78);

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

    // Progression states
    let sustainedShakeTimer = 0.0; // tracks continuous shaking in seconds
    let cShakeSlosh = 0.0;         // Stage 1 slosh & hitting walls
    let cShakeGas   = 0.0;         // Stage 2 vigorous 20-color plumes
    let crackLevel  = 0.0;         // Stage 3 crack growth
    let crackSeed   = Math.random();
    let colorTimer  = 0.0;
    const COLOR_SEC = 4;

    const render = (now) => {
      const elapsed = (now - t0)*0.001;
      const last    = lastFrameTimeRef.current || now;
      const rawDt   = (now-last)/1000.0;        // real seconds per frame
      const dt      = Math.min(rawDt*60, 3.0);  // normalised ~1 @ 60fps
      lastFrameTimeRef.current = now;

      gl.uniform1f(uTime, elapsed % 1000.0);

      // ── Drift: breathing-cadence lissajous + wall hitting bounce ─────────
      ang1 += (Math.PI*2/12)*rawDt;
      ang2 += (Math.PI*2/17)*rawDt;

      // Base gentle drift
      let targetCX = 0.5 + 0.20*Math.sin(ang1) + 0.08*Math.cos(ang2*1.3);
      let targetCY = 0.5 + 0.21*Math.cos(ang2) + 0.07*Math.sin(ang1*0.78);

      // When sloshing, the cloud aggressively swings wide towards walls
      if(cShakeSlosh > 0.01){
        const sloshX = Math.sin(elapsed * 9.0) * 0.32 * cShakeSlosh;
        const sloshY = Math.cos(elapsed * 7.5) * 0.30 * cShakeSlosh;
        targetCX += sloshX;
        targetCY += sloshY;
      }

      cx = Math.max(0.08, Math.min(0.92, targetCX));
      cy = Math.max(0.06, Math.min(0.94, targetCY));
      gl.uniform2f(uCC, cx, cy);

      // ── Breathing pulse (4.5s cycle) ─────────────────────────────────────
      gl.uniform1f(uBreathe, (Math.sin((elapsed*Math.PI*2)/4.5)+1.0)*0.5);

      // ── Colour cycle ──────────────────────────────────────────────────────
      colorTimer += rawDt;
      if(colorTimer >= COLOR_SEC){
        colorTimer = 0;
        hueRef.current = Math.round((hueRef.current + 60 + Math.random()*120) % 360);
        targetColorsRef.current = generateMonochromeShades(hueRef.current);
      }
      const ls = 0.016*dt;
      for(let i=0;i<5;i++)
        for(let j=0;j<3;j++)
          currentColorsRef.current[i][j] += (targetColorsRef.current[i][j]-currentColorsRef.current[i][j])*ls;
      gl.uniform3f(uC1,...currentColorsRef.current[0]);
      gl.uniform3f(uC2,...currentColorsRef.current[1]);
      gl.uniform3f(uC3,...currentColorsRef.current[2]);
      gl.uniform3f(uC4,...currentColorsRef.current[3]);
      gl.uniform3f(uC5,...currentColorsRef.current[4]);

      // ── Touch ─────────────────────────────────────────────────────────────
      ctx2 +=(ttx-ctx2)*0.20; cty +=(tty-cty)*0.20;
      tstr*=0.96; cstr+=(tstr-cstr)*0.20;
      gl.uniform2f(uTouch,ctx2,cty);
      gl.uniform1f(uTA,cstr);

      // ── Multi-Stage Shake Timeline: ───────────────────────────────────────
      // User requested:
      //  - 0s to 1.5s: Ignore accidental movement / casual hands moving
      //  - > 1.5s: First normal gas shakes violently & hits walls (slosh)
      //  - > 2.8s: Gases go vigorous, high-saturated 20-color colliding state hitting walls
      //  - > 4.2s: Realistic glass cracks appear & colored gas leaks out
      //  - Shake stops: natural lerped retrieval (gas goes back in, cracks heal, settle into random monochrome)
      const isShakingNow = (shakeIntensityRef.current > 0.05);

      if(isShakingNow){
        sustainedShakeTimer += rawDt;
        wasShaking = true;

        if(sustainedShakeTimer < 1.5){
          // Grace period: ignore brief / accidental movement
          cShakeSlosh = Math.max(0.0, cShakeSlosh - rawDt * 1.5);
          cShakeGas   = Math.max(0.0, cShakeGas - rawDt * 1.5);
        } else if(sustainedShakeTimer < 2.8){
          // Stage 1 (1.5s - 2.8s): Normal gas shakes too much, hitting walls
          const progress = (sustainedShakeTimer - 1.5) / 1.3;
          cShakeSlosh += (Math.min(1.0, progress * 1.2) - cShakeSlosh) * 0.12 * dt;
          cShakeGas    = Math.max(0.0, cShakeGas - rawDt * 1.2);
        } else if(sustainedShakeTimer < 4.2){
          // Stage 2 (2.8s - 4.2s): Vigorous 20-color colliding gas state hitting walls
          cShakeSlosh = 1.0;
          const progress = (sustainedShakeTimer - 2.8) / 1.4;
          cShakeGas += (Math.min(1.0, progress * 1.2) - cShakeGas) * 0.14 * dt;
        } else {
          // Stage 3 (> 4.2s): Sustained vigorous gas + realistic glass cracks & gas leak
          cShakeSlosh = 1.0;
          cShakeGas   = 1.0;
          crackLevel  = Math.min(1.0, crackLevel + rawDt * 0.65);
        }
      } else {
        // Shaking stopped! Graceful, smooth, lerped retrieval
        if(wasShaking && sustainedShakeTimer >= 1.5){
          // Transition into a new pleasant random monochrome shade
          hueRef.current = Math.floor(Math.random()*360);
          targetColorsRef.current = generateMonochromeShades(hueRef.current);
          colorTimer = 0;
        }
        wasShaking = false;
        sustainedShakeTimer = 0.0;

        // Smooth decay / healing:
        // 1. Cracks heal and gas goes back in
        crackLevel  = Math.max(0.0, crackLevel  - rawDt * 0.35);
        if(crackLevel < 0.01) crackSeed = Math.random();

        // 2. Vigorous gas calms down
        cShakeGas   = Math.max(0.0, cShakeGas   - rawDt * 0.45);

        // 3. Wall sloshing settles back to normal gentle breathing
        cShakeSlosh = Math.max(0.0, cShakeSlosh - rawDt * 0.55);
      }

      gl.uniform1f(uShakeSlosh, cShakeSlosh);
      gl.uniform1f(uShake,      cShakeGas);
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
