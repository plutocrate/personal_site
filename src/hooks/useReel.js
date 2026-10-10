import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Smooth, cinematic spring transition tailored for reel snaps
export const slideVariants = {
  enter: (d) => ({ y: d > 0 ? '100%' : '-100%', opacity: 0.95 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d > 0 ? '-100%' : '100%', opacity: 0.95 }),
};
export const slideTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

// useReel: Manages reel-like swipe and scroll physics.
// Prevents accidental transitions on gentle scrolls / micro-swipes.
export function useReel(items, base) {
  const { id } = useParams();
  const navigate = useNavigate();
  const found = items.findIndex((i) => i.id === id);
  const index = found < 0 ? 0 : found;

  const meta = useRef({ index, dir: 0 });
  if (meta.current.index !== index) meta.current = { index, dir: index > meta.current.index ? 1 : -1 };

  const lock = useRef({ on: false, last: 0, accumulatedDelta: 0, lastDeltaTime: 0 });

  const go = useCallback((step) => {
    const n = index + step;
    const L = lock.current;
    if (L.on || n < 0 || n >= items.length) return;
    navigate(`${base}/${items[n].id}`, { replace: true });
    L.on = true;
    L.accumulatedDelta = 0;
    const t0 = Date.now();
    // Maintain lock to absorb trackpad / momentum wheel flickers
    const release = () => {
      if (Date.now() - L.last > 220 && Date.now() - t0 > 650) {
        L.on = false;
        L.accumulatedDelta = 0;
      } else {
        setTimeout(release, 60);
      }
    };
    setTimeout(release, 60);
  }, [index, items, base, navigate]);

  useEffect(() => {
    const wheel = (e) => {
      if (document.querySelector('.topic-widget-sheet') || e.target?.closest?.('.topic-widget-sheet, .topic-widget-backdrop, .sidebar')) return;
      
      const now = Date.now();
      lock.current.last = now;

      if (lock.current.on) return;

      // Reset accumulated scroll if user paused scrolling
      if (now - lock.current.lastDeltaTime > 250) {
        lock.current.accumulatedDelta = 0;
      }
      lock.current.lastDeltaTime = now;
      lock.current.accumulatedDelta += e.deltaY;

      // Intentional gesture threshold: requires deliberate scroll (110px accumulated) or strong flick (> 90px single tick)
      const threshold = 110;
      if (Math.abs(lock.current.accumulatedDelta) >= threshold || Math.abs(e.deltaY) > 90) {
        const step = (lock.current.accumulatedDelta !== 0 ? lock.current.accumulatedDelta : e.deltaY) > 0 ? 1 : -1;
        go(step);
      }
    };

    const key = (e) => {
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) go(1);
      if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) go(-1);
    };

    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', key);
    };
  }, [go]);

  // Touch / Pointer Drag physics:
  // Requires dragging past 28% of the viewport height or an intentional fast swipe (> 950px/s)
  const dragProps = {
    drag: 'y',
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: 0.28, // Firm, satisfying resistance
    dragMomentum: false,
    onDragEnd: (_, { offset, velocity }) => {
      const distanceThreshold = Math.max(window.innerHeight * 0.26, 120);
      const velocityThreshold = 950;

      // Only transition if the drag was intentional
      if (offset.y < -distanceThreshold || velocity.y < -velocityThreshold) {
        go(1);
      } else if (offset.y > distanceThreshold || velocity.y > velocityThreshold) {
        go(-1);
      }
    },
  };

  return { index, dir: meta.current.dir, go, dragProps };
}
