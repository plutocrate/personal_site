import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Fast, snappy spring transition for reels
export const slideVariants = {
  enter: (d) => ({ y: d > 0 ? '100%' : '-100%', opacity: 0.95 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d > 0 ? '-100%' : '100%', opacity: 0.95 }),
};
export const slideTransition = { duration: 0.38, ease: [0.16, 1, 0.3, 1] };

// useReel: Highly responsive, fast reel swipe and wheel scroll.
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
    // Quick lock release (300ms) so consecutive scrolling feels instantaneous and fluid
    const release = () => {
      if (Date.now() - L.last > 140 && Date.now() - t0 > 320) {
        L.on = false;
        L.accumulatedDelta = 0;
      } else {
        setTimeout(release, 40);
      }
    };
    setTimeout(release, 40);
  }, [index, items, base, navigate]);

  useEffect(() => {
    const wheel = (e) => {
      if (document.querySelector('.topic-widget-sheet') || e.target?.closest?.('.topic-widget-sheet, .topic-widget-backdrop, .sidebar')) return;
      
      const now = Date.now();
      lock.current.last = now;

      if (lock.current.on) return;

      if (now - lock.current.lastDeltaTime > 200) {
        lock.current.accumulatedDelta = 0;
      }
      lock.current.lastDeltaTime = now;
      lock.current.accumulatedDelta += e.deltaY;

      // Fast, responsive wheel threshold: 38px accumulated or 28px single tick
      const threshold = 38;
      if (Math.abs(lock.current.accumulatedDelta) >= threshold || Math.abs(e.deltaY) > 28) {
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
  // Snappy response: 12% viewport distance threshold (~70px) or quick swipe velocity (> 400px/s)
  const dragProps = {
    drag: 'y',
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: 0.35,
    dragMomentum: false,
    onDragEnd: (_, { offset, velocity }) => {
      const distanceThreshold = Math.max(window.innerHeight * 0.12, 65);
      const velocityThreshold = 400;

      if (offset.y < -distanceThreshold || velocity.y < -velocityThreshold) {
        go(1);
      } else if (offset.y > distanceThreshold || velocity.y > velocityThreshold) {
        go(-1);
      }
    },
  };

  return { index, dir: meta.current.dir, go, dragProps };
}
