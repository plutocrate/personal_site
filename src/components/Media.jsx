import { useState, useRef, useEffect } from 'react';
import YouTube from './YouTube.jsx';
import LocalVideo from './LocalVideo.jsx';
import { prefetchUrl, preconnectOrigin } from '../utils/prefetch.js';
import { saveMediaDims } from '../utils/mediaDims.js';

// Global Frame Node Cache:
// Preserves alive iframe DOM instances across slide switches and page transitions,
// so when switching reels back and forth, the embed isn't destroyed or re-fetched.
const iframeNodeCache = new Map();

function PersistentIframe({ src, title, unlocked }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!src || !containerRef.current) return;

    // Prefetch URL and preconnect host speculatively
    prefetchUrl(src);
    preconnectOrigin(src);

    let frame = iframeNodeCache.get(src);
    if (!frame) {
      frame = document.createElement('iframe');
      frame.src = src;
      frame.title = title || 'Embedded content';
      frame.frameBorder = '0';
      frame.scrolling = 'no';
      frame.loading = 'eager';
      frame.allowFullscreen = true;
      frame.style.width = '100%';
      frame.style.height = '100%';
      frame.style.border = 'none';
      frame.style.display = 'block';
      frame.style.borderRadius = 'inherit';
      iframeNodeCache.set(src, frame);
    }

    const container = containerRef.current;
    if (frame.parentNode !== container) {
      container.appendChild(frame);
    }

    return () => {
      // Keep frame retained in cache without destroying the underlying document/player state
      if (frame.parentNode === container) {
        container.removeChild(frame);
      }
    };
  }, [src, title]);

  useEffect(() => {
    const frame = iframeNodeCache.get(src);
    if (frame) {
      frame.style.pointerEvents = unlocked ? 'auto' : 'none';
    }
  }, [src, unlocked]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
    />
  );
}

// media: { type: 'youtube', id } | { type: 'video', src, poster } | { type: 'iframe', src } | { type: 'image', src }
export default function Media({ media, onSizeKnown }) {
  const [unlocked, setUnlocked] = useState(false);
  const lastTapRef = useRef(0);

  if (!media) return null;

  if (media.type === 'youtube') {
    // YouTube is always 16:9
    if (onSizeKnown) onSizeKnown(16, 9);
    return <YouTube id={media.id} />;
  }

  if (media.type === 'video') return <LocalVideo src={media.src} poster={media.poster} onSizeKnown={onSizeKnown} />;

  if (media.type === 'iframe') {
    // iframes default to 16:9 unless told otherwise
    if (onSizeKnown) onSizeKnown(16, 9);
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
        <PersistentIframe
          src={media.src}
          title={media.title || 'Embedded content'}
          unlocked={unlocked}
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

  // image — fire onSizeKnown from naturalWidth/Height after load or immediately if cached
  return (
    <img
      ref={(el) => {
        if (el && el.complete && el.naturalWidth && el.naturalHeight) {
          saveMediaDims(media, el.naturalWidth, el.naturalHeight);
          if (onSizeKnown) onSizeKnown(el.naturalWidth, el.naturalHeight);
        }
      }}
      className="media-img"
      src={media.src}
      alt=""
      draggable={false}
      onLoad={(e) => {
        if (e.target.naturalWidth && e.target.naturalHeight) {
          saveMediaDims(media, e.target.naturalWidth, e.target.naturalHeight);
          if (onSizeKnown) {
            onSizeKnown(e.target.naturalWidth, e.target.naturalHeight);
          }
        }
      }}
    />
  );
}
