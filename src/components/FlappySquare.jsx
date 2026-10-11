import { useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics.js';

/**
 * FlappySquare Mini Game
 * - Pure geometry shapes (square player, rectangular obstacles).
 * - No background, no borders.
 * - Dynamic color algorithms from the site's palette (high contrast player, softer contrast obstacles).
 * - Spacebar, Click, or Tap to flap.
 */
export const FlappySquare = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('flappy_square_high') || '0', 10);
    } catch {
      return 0;
    }
  });

  const stateRef = useRef({
    state: 'idle',
    score: 0,
    bird: { y: 150, vy: 0, size: 22, rot: 0 },
    pipes: [],
    frame: 0,
    w: 0,
    h: 0,
    lastTime: performance.now(),
  });

  const jump = () => {
    const s = stateRef.current;
    if (s.state === 'idle') {
      s.state = 'playing';
      s.score = 0;
      s.bird.y = s.h * 0.45;
      s.bird.vy = -4.6; // gentle, controlled hop
      s.pipes = [];
      setGameState('playing');
      setScore(0);
      vibrate([24, 30, 24]); // Crisp double pulse when starting the game
      return;
    }
    if (s.state === 'gameover') {
      s.state = 'playing';
      s.score = 0;
      s.bird.y = s.h * 0.45;
      s.bird.vy = -4.6;
      s.pipes = [];
      setGameState('playing');
      setScore(0);
      vibrate([24, 30, 24]); // Crisp double pulse when restarting the game
      return;
    }
    if (s.state === 'playing') {
      s.bird.vy = -4.6; // lower jump velocity paired with reduced gravity
      vibrate(10); // Light, crisp hop vibration
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current.w = rect.width;
      stateRef.current.h = rect.height;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    // When the game is actively running, tapping/clicking anywhere allows the player to jump
    const onGlobalPointerDown = (e) => {
      // Don't intercept clicks on navigation links or interactive buttons
      if (e.target.closest('a, button, nav, .sidebar, .mobile-topbar')) return;
      if (stateRef.current.state === 'playing') {
        jump();
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onGlobalPointerDown);

    let raf;
    const loop = (now) => {
      const dt = Math.min((now - stateRef.current.lastTime) / 16.67, 2.5);
      stateRef.current.lastTime = now;
      const s = stateRef.current;
      const { w, h, bird } = s;

      if (w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);

        // Fetch dynamic theme colors from root CSS variables
        const computed = getComputedStyle(document.documentElement);
        const playerFill = computed.getPropertyValue('--ink').trim() || '#1d1d1f';
        const playerAccent = computed.getPropertyValue('--hl-high-7').trim() || '#ff4572';
        const obstacleFill = computed.getPropertyValue('--hl-low-5').trim() || 'rgba(0, 113, 227, 0.45)';
        const obstacleBorder = computed.getPropertyValue('--line').trim() || 'rgba(40, 38, 28, 0.12)';
        const guideColor = computed.getPropertyValue('--ink-3').trim() || '#8e8e93';

        // Physics step
        if (s.state === 'playing') {
          s.frame++;
          bird.vy += 0.20 * dt; // reduced gravity (was 0.28) for much smoother float
          bird.y += bird.vy * dt;
          bird.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, bird.vy * 0.08));

          // Dynamic obstacle horizontal spacing based on screen width:
          // On mobile (~320-380px wide container), distance between pipes is tightly tuned (170-195px).
          // On tablets & laptops (480-560px), distance scales proportionally (200-240px).
          const pipeDistance = Math.min(235, Math.max(165, w * 0.46));
          const pipeScrollSpeed = 2.1 * dt;
          const spawnIntervalFrames = Math.max(70, Math.round(pipeDistance / 2.1));

          // Spawn obstacle pipes
          const lastPipe = s.pipes[s.pipes.length - 1];
          const shouldSpawn = s.pipes.length === 0 || (w + 20 - lastPipe.x >= pipeDistance);

          if (shouldSpawn) {
            // Gap between top and bottom pipe: tight and engaging on all devices (95px to 118px)
            const gap = Math.min(118, Math.max(96, h * 0.33));
            const minHeight = 35;
            const maxTop = Math.max(minHeight, h - gap - minHeight);
            const topHeight = Math.floor(minHeight + Math.random() * (maxTop - minHeight));
            const slotNum = ((s.pipes.length % 8) + 1);
            const slotColor = computed.getPropertyValue(`--hl-low-${slotNum}`).trim() || obstacleFill;
            // Width of pipe scales slightly with canvas width (32px on phone, 38px on desktop)
            const pipeW = Math.min(38, Math.max(30, Math.round(w * 0.075)));
            s.pipes.push({
              x: w + 15,
              w: pipeW,
              top: topHeight,
              bottom: Math.max(minHeight, h - (topHeight + gap)),
              passed: false,
              color: slotColor,
            });
          }

          // Move and check pipes
          const birdX = w * 0.28;
          // Shortened hitbox: visual square size is 22px, with forgiving player bounds
          const hitRadius = (bird.size / 2) * 0.72;

          for (let i = s.pipes.length - 1; i >= 0; i--) {
            const p = s.pipes[i];
            p.x -= pipeScrollSpeed;

            // Score point
            if (!p.passed && p.x + p.w < birdX) {
              p.passed = true;
              s.score++;
              setScore(s.score);
              setHighScore((prev) => {
                const next = Math.max(prev, s.score);
                try { localStorage.setItem('flappy_square_high', next); } catch {}
                return next;
              });
            }

            // Shortened collision check for obstacle pipes (2px inset on obstacle boundaries)
            const pipeLeft = p.x + 2;
            const pipeRight = p.x + p.w - 2;
            const collidesX = birdX + hitRadius > pipeLeft && birdX - hitRadius < pipeRight;
            const collidesTop = bird.y - hitRadius < p.top;
            const collidesBottom = bird.y + hitRadius > h - p.bottom;

            if (collidesX && (collidesTop || collidesBottom)) {
              s.state = 'gameover';
              setGameState('gameover');
              vibrate([80, 50, 160]); // Longer, heavy impact vibration on collision
            }

            // Remove off-screen pipes
            if (p.x + p.w < -20) {
              s.pipes.splice(i, 1);
            }
          }

          // Ceiling / ground collision with forgiving boundaries
          if (bird.y - hitRadius < 0) {
            bird.y = hitRadius;
            bird.vy = 0;
          }
          if (bird.y + hitRadius >= h) {
            s.state = 'gameover';
            setGameState('gameover');
            vibrate([80, 50, 160]); // Longer, heavy impact vibration on crash
          }
        }

        // Draw Pipes (Geometric Rectangles with lower contrast tint)
        s.pipes.forEach((p) => {
          ctx.fillStyle = p.color;
          ctx.strokeStyle = obstacleBorder;
          ctx.lineWidth = 1;

          // Top pipe
          ctx.fillRect(p.x, 0, p.w, p.top);
          ctx.strokeRect(p.x, 0, p.w, p.top);

          // Bottom pipe
          ctx.fillRect(p.x, h - p.bottom, p.w, p.bottom);
          ctx.strokeRect(p.x, h - p.bottom, p.w, p.bottom);
        });

        // Draw Player Square (High Contrast, Geometric)
        const birdX = w * 0.28;
        ctx.save();
        ctx.translate(birdX, bird.y);
        ctx.rotate(bird.rot);

        // Core geometric square
        const sz = bird.size;
        ctx.fillStyle = playerFill;
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);

        // Inner glowing high-contrast geometric pupil/core
        const innerSz = sz * 0.38;
        ctx.fillStyle = playerAccent;
        ctx.fillRect(-innerSz / 2 + 3, -innerSz / 2, innerSz, innerSz);

        ctx.restore();

        // Overlay text / prompts rendered cleanly inside canvas
        if (s.state === 'idle') {
          bird.y = h * 0.45 + Math.sin(now * 0.004) * 8;
          ctx.font = '500 13.5px var(--font)';
          ctx.fillStyle = guideColor;
          ctx.textAlign = 'center';
          ctx.fillText('Tap or press Space to jump', w / 2, h * 0.72);
        } else if (s.state === 'gameover') {
          ctx.font = '600 16px var(--font)';
          ctx.fillStyle = playerFill;
          ctx.textAlign = 'center';
          ctx.fillText('Game Over', w / 2, h * 0.38);

          ctx.font = '500 13.5px var(--font)';
          ctx.fillStyle = guideColor;
          ctx.fillText('Tap or press Space to retry', w / 2, h * 0.72);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onGlobalPointerDown);
    };
  }, []);

  return (
    <div
      className="flappy-square-container"
      onClick={jump}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        maxWidth: '560px',
        margin: '28px auto 0',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '13px',
          color: 'var(--ink-3)',
          fontWeight: '500',
          pointerEvents: 'none',
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <span>Score: <b style={{ color: 'var(--ink)' }}>{score}</b></span>
        <span>Best: <b style={{ color: 'var(--ink)' }}>{highScore}</b></span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'none', // parent div receives click/tap to flap
        }}
      />
    </div>
  );
};
