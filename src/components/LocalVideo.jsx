import { useEffect, useRef, useState } from 'react';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * LocalVideo:
 * Custom minimalist HTML5 video player matching our YouTube player design:
 * - Floating center play glyph on paused state
 * - Clean bottom overlay bar with play/pause, seek track, time counter, and mute
 * - Snappy pointer click protection to prevent drags from accidentally pausing
 */
export default function LocalVideo({ src, poster }) {
  const videoRef = useRef(null);
  const down = useRef({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      setTime({ cur: v.currentTime, dur: v.duration || 0 });
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => setMuted(v.muted);
    const onLoadedMetadata = () => {
      setTime({ cur: v.currentTime, dur: v.duration || 0 });
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVolumeChange);
    v.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('volumechange', onVolumeChange);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [src]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e) => {
    const v = videoRef.current;
    if (!v || !time.dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    v.currentTime = ratio * time.dur;
  };

  const onHitClick = (e) => {
    if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 6) {
      toggle();
    }
  };

  return (
    <div className="yt" data-interactive onClick={(e) => e.stopPropagation()}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        loop
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 'inherit',
        }}
      />

      <button
        type="button"
        className="yt-hit"
        onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
        onClick={onHitClick}
        aria-label={playing ? 'Pause video' : 'Play video'}
      />

      <span className={`yt-glyph${playing ? '' : ' show'}`} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 1.5v11l9-5.5z" />
        </svg>
      </span>

      <div className="yt-bar">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="1.5" width="3" height="9" rx="1" />
              <rect x="7" y="1.5" width="3" height="9" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 1v10l8-5z" />
            </svg>
          )}
        </button>

        <div className="yt-track" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(time.cur)}>
          <i style={{ width: time.dur ? `${(time.cur / time.dur) * 100}%` : 0 }} />
        </div>

        <span className="yt-time">{fmt(time.cur)}</span>

        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5.5h2.5L8 2.5v9L4.5 8.5H2z" fill="currentColor" />
            {muted ? <path d="M10 5l3 4M13 5l-3 4" /> : <path d="M10 5.2c.9.9.9 2.7 0 3.6" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
