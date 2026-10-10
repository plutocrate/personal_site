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
      s.bird.vy = -5.8;
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
      s.bird.vy = -5.8;
      s.pipes = [];
      setGameState('playing');
      setScore(0);
      vibrate([24, 30, 24]); // Crisp double pulse when restarting the game
      return;
    }
    if (s.state === 'playing') {
      s.bird.vy = -5.8;
      vibrate(10); // Light, crisp hop vibration (lesser than start and death)
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
    window.addEventListener('keydown', onKey);

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
          bird.vy += 0.28 * dt; // gravity
          bird.y += bird.vy * dt;
          bird.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, bird.vy * 0.08));

          // Spawn obstacle pipes (rectangles)
          if (s.frame % 105 === 0 || s.pipes.length === 0) {
            const gap = Math.max(90, Math.min(130, h * 0.34));
            const topMax = h - gap - 60;
            const topHeight = Math.floor(40 + Math.random() * (topMax - 40));
            // Color slot for obstacle
            const slotNum = ((s.pipes.length % 8) + 1);
            const slotColor = computed.getPropertyValue(`--hl-low-${slotNum}`).trim() || obstacleFill;
            s.pipes.push({
              x: w + 20,
              w: 42,
              top: topHeight,
              bottom: h - (topHeight + gap),
              passed: false,
              color: slotColor,
            });
          }

          // Move and check pipes
          const birdX = w * 0.28;
          const halfSize = bird.size / 2;

          for (let i = s.pipes.length - 1; i >= 0; i--) {
            const p = s.pipes[i];
            p.x -= 2.4 * dt;

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

            // AABB Collision check
            const collidesX = birdX + halfSize > p.x && birdX - halfSize < p.x + p.w;
            const collidesTop = bird.y - halfSize < p.top;
            const collidesBottom = bird.y + halfSize > h - p.bottom;

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

          // Ceiling / ground collision
          if (bird.y - halfSize < 0) {
            bird.y = halfSize;
            bird.vy = 0;
          }
          if (bird.y + halfSize >= h) {
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
