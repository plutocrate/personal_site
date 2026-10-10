import { useState, useRef } from 'react';
import YouTube from './YouTube.jsx';
import LocalVideo from './LocalVideo.jsx';

// media: { type: 'youtube', id } | { type: 'video', src, poster } | { type: 'iframe', src, width, height, aspectRatio } | { type: 'image', src }
export default function Media({ media }) {
  const [unlocked, setUnlocked] = useState(false);
  const lastTapRef = useRef(0);

  if (!media) return null;

  if (media.type === 'youtube') return <YouTube id={media.id} />;

  if (media.type === 'video') return <LocalVideo src={media.src} poster={media.poster} />;

  if (media.type === 'iframe') {
    const handleTapOrClick = (e) => {
      const now = Date.now();
      const diff = now - lastTapRef.current;
      lastTapRef.current = now;

      // Double-tap detected (within 350ms): unlock direct iframe interaction
      if (diff < 350) {
        setUnlocked(true);
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
          overscrollBehavior: 'none',
        }}
        onPointerLeave={() => setUnlocked(false)}
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
            pointerEvents: unlocked ? 'auto' : 'none',
          }}
        />

        {/* Shield overlay that absorbs finger drags and prevents accidental reloads / sticks */}
        {!unlocked && (
          <div
            className="media-gesture-shield"
            onClick={handleTapOrClick}
            title="Swipe freely · Double-tap to interact with embed"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 4,
              background: 'transparent',
              touchAction: 'pan-y',
              cursor: 'grab',
            }}
          >
            <div
              className="media-double-tap-hint"
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(20, 20, 25, 0.72)',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 500,
                backdropFilter: 'blur(8px)',
                pointerEvents: 'none',
                opacity: 0.7,
              }}
            >
              Double-tap to interact
            </div>
          </div>
        )}
      </div>
    );
  }

  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
