import { useRef, useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * TopicRail Component
 * Displays the right-side section topic index with full-area scrolling,
 * interactive scrubbing, and draggable scrollbar tracking.
 */
export default function TopicRail({ items, index, base }) {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const wheelLock = useRef(0);
  const hasMoved = useRef(false);

  // Navigate to item at normalized vertical fraction [0, 1]
  const scrubToIndex = useCallback(
    (clientY) => {
      const container = trackRef.current || wrapperRef.current;
      if (!container || !items || items.length <= 1) return;
      const rect = container.getBoundingClientRect();
      const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      const targetIndex = Math.round(relativeY * (items.length - 1));
      if (targetIndex >= 0 && targetIndex < items.length && targetIndex !== index) {
        navigate(`${base}/${items[targetIndex].id}`, { replace: true });
      }
    },
    [items, index, base, navigate]
  );

  // Wheel scrolling directly over the rail area
  const onWheel = useCallback(
    (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (now - wheelLock.current < 180) return;
      if (Math.abs(e.deltaY) > 12) {
        const nextIndex = e.deltaY > 0 ? index + 1 : index - 1;
        if (nextIndex >= 0 && nextIndex < items.length) {
          wheelLock.current = now;
          navigate(`${base}/${items[nextIndex].id}`, { replace: true });
        }
      }
    },
    [index, items, base, navigate]
  );

  // Start drag/scrub on pointerdown across the rail area
  const onPointerDown = (e) => {
    // Only left clicks or touches
    if (e.button !== 0 && e.button !== undefined) return;
    hasMoved.current = false;
    setIsDragging(true);
    scrubToIndex(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e) => {
      hasMoved.current = true;
      scrubToIndex(e.clientY);
    };

    const onPointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, scrubToIndex]);

  const progress = items && items.length > 1 ? index / (items.length - 1) : 0;

  return (
    <div
      className={`rail-wrapper${isDragging ? ' is-scrubbing' : ''}`}
      ref={wrapperRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      style={{ touchAction: 'none' }}
    >
      <nav className="rail" aria-label="Topics">
        {items.map((it, i) => {
          const d = Math.abs(i - index);
          const o = d === 0 ? 1 : Math.max(0.2, 0.62 - (d - 1) * 0.16);
          return (
            <Link
              key={it.id}
              to={`${base}/${it.id}`}
              onPointerDown={(e) => {
                // Prevent wrapper scrubber from hijacking direct click on item
                e.stopPropagation();
              }}
              onClick={(e) => {
                if (hasMoved.current) {
                  e.preventDefault();
                } else {
                  navigate(`${base}/${it.id}`);
                }
              }}
              className={`rail-item${d === 0 ? ' on' : ''}`}
              style={{ '--o': o }}
              aria-current={d === 0 ? 'page' : undefined}
            >
              <i />
              <span>{it.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Interactive Draggable Scrollbar Scrubber */}
      <div
        className="rail-scrollbar"
        ref={trackRef}
        title="Drag, click, or scroll to pan over sections"
        role="scrollbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={items.length}
      >
        <div className="rail-track">
          <div
            className="rail-thumb"
            style={{
              top: `${progress * 100}%`,
              transform: `translateY(-${progress * 100}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
