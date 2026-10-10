import { useState, useRef } from 'react';
import YouTube from './YouTube.jsx';

// media: { type: 'youtube', id } | { type: 'iframe', src, width, height, aspectRatio } | { type: 'image', src }
export default function Media({ media }) {
  const [interact, setInteract] = useState(false);
  const downRef = useRef({ x: 0, y: 0, time: 0 });

  if (!media) return null;

  if (media.type === 'youtube') return <YouTube id={media.id} />;

  if (media.type === 'iframe') {
    const onPointerDown = (e) => {
      downRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const onClick = (e) => {
      const dist = Math.hypot(e.clientX - downRef.current.x, e.clientY - downRef.current.y);
      const elapsed = Date.now() - downRef.current.time;
      // If it's a quick tap without drag movement, enable direct iframe interaction
      if (dist < 8 && elapsed < 400) {
        setInteract(true);
      }
    };

    return (
      <div
        className="responsive-iframe-wrap"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'inherit',
          background: 'transparent',
        }}
        onPointerLeave={() => setInteract(false)}
      >
        <iframe
          src={media.src}
          title={media.title || 'Embedded content'}
          frameBorder="0"
          scrolling="no"
          loading="lazy"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            borderRadius: 'inherit',
            pointerEvents: interact ? 'auto' : 'none',
          }}
        />

        {/* Overlay shield that allows parent dragging/swiping/scrolling */}
        {!interact && (
          <div
            className="media-drag-overlay"
            onPointerDown={onPointerDown}
            onClick={onClick}
            title="Drag to scroll reel · Tap to interact"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 3,
              cursor: 'grab',
              background: 'transparent',
              touchAction: 'none',
            }}
          />
        )}
      </div>
    );
  }

  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
