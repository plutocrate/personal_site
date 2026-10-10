import { useEffect, useRef } from 'react';

export default function SimStage({ sim }) {
  const ref = useRef(null);

  useEffect(() => {
    if (sim?.start && ref.current) {
      return sim.start(ref.current);
    }
  }, [sim]);

  return sim?.start ? (
    <canvas
      ref={ref}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
    />
  ) : (
    <div className="stage-empty">Simulation in progress</div>
  );
}
