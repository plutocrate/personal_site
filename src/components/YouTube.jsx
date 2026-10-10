import { useEffect, useRef, useState } from 'react';

let apiPromise;
const loadApi = () => (apiPromise ||= new Promise((resolve) => {
  if (window.YT?.Player) return resolve(window.YT);
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}));

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Paused by default, sound on when played. YouTube's own UI is cropped out and replaced by ours.
export default function YouTube({ id }) {
  const mount = useRef(null);
  const player = useRef(null);
  const down = useRef({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => {
    let dead = false, timer;
    loadApi().then((YT) => {
      if (dead || !mount.current) return;
      player.current = new YT.Player(mount.current, {
        videoId: id,
        playerVars: { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0, playsinline: 1, autoplay: 0, loop: 1, playlist: id, origin: window.location.origin },
        events: {
          onReady: (e) => setMuted(e.target.isMuted()),
          onStateChange: (e) => setPlaying(e.data === 1),
        },
      });
      timer = setInterval(() => {
        const p = player.current;
        if (p?.getCurrentTime) setTime({ cur: p.getCurrentTime(), dur: p.getDuration() || 0 });
      }, 300);
    });
    return () => { dead = true; clearInterval(timer); try { player.current?.destroy(); } catch { /* already gone */ } };
  }, [id]);

  const toggle = () => { const p = player.current; if (p?.playVideo) (playing ? p.pauseVideo() : p.playVideo()); };
  const mute = () => { const p = player.current; if (!p?.isMuted) return; p.isMuted() ? p.unMute() : p.mute(); setMuted(p.isMuted()); };
  const seek = (e) => {
    const p = player.current; if (!p?.seekTo || !time.dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    p.seekTo(((e.clientX - r.left) / r.width) * time.dur, true);
  };
  // a drag that happens to end on the video must not count as a click
  const onHitClick = (e) => { if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 6) toggle(); };

  return (
    <div className="yt" data-interactive onClick={(e) => e.stopPropagation()}>
      <div className="yt-frame"><div ref={mount} /></div>
      <button className="yt-hit" onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }} onClick={onHitClick}
        aria-label={playing ? 'Pause video' : 'Play video'} />
      <span className={`yt-glyph${playing ? '' : ' show'}`} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
      </span>
      <div className="yt-bar">
        <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing
            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1v10l8-5z" /></svg>}
        </button>
        <div className="yt-track" onClick={seek} role="slider" aria-label="Seek" aria-valuenow={Math.round(time.cur)}>
          <i style={{ width: time.dur ? `${(time.cur / time.dur) * 100}%` : 0 }} />
        </div>
        <span className="yt-time">{fmt(time.cur)}</span>
        <button onClick={mute} aria-label={muted ? 'Unmute' : 'Mute'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5.5h2.5L8 2.5v9L4.5 8.5H2z" fill="currentColor" />
            {muted ? <path d="M10 5l3 4M13 5l-3 4" /> : <path d="M10 5.2c.9.9.9 2.7 0 3.6" />}
          </svg>
        </button>
      </div>
    </div>
  );
}
