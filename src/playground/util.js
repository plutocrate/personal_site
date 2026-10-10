// Shared canvas helper: DPR-aware sizing, pointer tracking, rAF loop, cleanup.
export function mount(canvas, setup) {
  const ctx = canvas.getContext('2d');
  const s = { w: 0, h: 0, mx: null, my: null, ctx, dark: false };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (r.width === 0 || r.height === 0) return;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.w = r.width;
    s.h = r.height;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const updatePos = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    s.mx = clientX - r.left;
    s.my = clientY - r.top;
  };

  const onPointer = (e) => {
    updatePos(e.clientX, e.clientY);
  };

  const onTouch = (e) => {
    if (e.touches && e.touches[0]) {
      updatePos(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const leave = () => {
    s.mx = null;
    s.my = null;
  };

  // Attach comprehensive pointer & touch listeners
  canvas.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('pointerdown', onPointer, { passive: true });
  canvas.addEventListener('pointerenter', onPointer, { passive: true });
  canvas.addEventListener('mousemove', onPointer, { passive: true });
  canvas.addEventListener('mouseenter', onPointer, { passive: true });
  canvas.addEventListener('touchmove', onTouch, { passive: true });
  canvas.addEventListener('touchstart', onTouch, { passive: true });
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('pointerout', leave);
  canvas.addEventListener('mouseleave', leave);
  canvas.addEventListener('touchend', leave);

  const frame = setup(s);
  let raf, last = performance.now();
  const loop = (t) => {
    // Clamp dt strictly so pauses/tab switches never produce explosive physics steps
    const rawDt = (t - last) / 16.67;
    const dt = Math.min(Math.max(rawDt, 0.2), 1.5);
    frame(dt);
    last = t;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerdown', onPointer);
    canvas.removeEventListener('pointerenter', onPointer);
    canvas.removeEventListener('mousemove', onPointer);
    canvas.removeEventListener('mouseenter', onPointer);
    canvas.removeEventListener('touchmove', onTouch);
    canvas.removeEventListener('touchstart', onTouch);
    canvas.removeEventListener('pointerleave', leave);
    canvas.removeEventListener('pointerout', leave);
    canvas.removeEventListener('mouseleave', leave);
    canvas.removeEventListener('touchend', leave);
  };
}
