import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Slides move as one unit, like a carousel: the old one leaves as the new one arrives.
export const slideVariants = {
  enter: (d) => ({ y: d > 0 ? '100%' : '-100%' }),
  center: { y: 0 },
  exit: (d) => ({ y: d > 0 ? '-100%' : '100%' }),
};
export const slideTransition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };

// The current item lives in the URL (/base/:id), so every item is a real, shareable page.
// Wheel, arrow keys, and dragging the slide all move between items.
export function useReel(items, base) {
  const { id } = useParams();
  const navigate = useNavigate();
  const found = items.findIndex((i) => i.id === id);
  const index = found < 0 ? 0 : found;

  const meta = useRef({ index, dir: 0 });
  if (meta.current.index !== index) meta.current = { index, dir: index > meta.current.index ? 1 : -1 };

  const lock = useRef({ on: false, last: 0 });
  const go = useCallback((step) => {
    const n = index + step;
    const L = lock.current;
    if (L.on || n < 0 || n >= items.length) return;
    navigate(`${base}/${items[n].id}`, { replace: true });
    L.on = true;
    const t0 = Date.now();
    // stay locked until trackpad inertia has stopped
    const release = () => { if (Date.now() - L.last > 160 && Date.now() - t0 > 550) L.on = false; else setTimeout(release, 80); };
    setTimeout(release, 80);
  }, [index, items, base, navigate]);

  useEffect(() => {
    const wheel = (e) => {
      if (document.querySelector('.topic-widget-sheet') || e.target?.closest?.('.topic-widget-sheet, .topic-widget-backdrop, .sidebar')) return;
      lock.current.last = Date.now();
      if (Math.abs(e.deltaY) > 24) go(e.deltaY > 0 ? 1 : -1);
    };
    const key = (e) => {
      if (['ArrowDown', 'PageDown', 'j'].includes(e.key)) go(1);
      if (['ArrowUp', 'PageUp', 'k'].includes(e.key)) go(-1);
    };
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key); };
  }, [go]);

  // Hold and drag the whole slide; letting go past the threshold changes item, otherwise it snaps back.
  const dragProps = {
    drag: 'y',
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: 0.45,
    dragMomentum: false,
    onDragEnd: (_, { offset, velocity }) => {
      const t = window.innerHeight * 0.16;
      if (offset.y < -t || velocity.y < -700) go(1);
      else if (offset.y > t || velocity.y > 700) go(-1);
    },
  };

  return { index, dir: meta.current.dir, go, dragProps };
}
