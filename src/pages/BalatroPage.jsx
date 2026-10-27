import { useRef, useEffect, useState } from 'react';
import Crumbs from '../components/Crumbs.jsx';
import Arrow from '../components/Arrow.jsx';
import BalatroLogo from '../components/BalatroLogo.jsx';
import { vibrate } from '../utils/haptics.js';

export default function BalatroPage() {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPhone, setIsPhone] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 860);

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth <= 860);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullscreen = async () => {
    vibrate(12);
    const elem = containerRef.current || document.documentElement;

    if (!document.fullscreenElement) {
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (_) {}
    } else {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (_) {}
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="balatro-page">
      <div className="page-crumbs desktop-only-bar">
        <Crumbs trail={[{ label: 'About', to: '/' }, { label: 'Balatro' }]} />
      </div>

      <div className="balatro-container">
        {/* Clean Typographic Header matching the site's visual language */}
        <header className="balatro-header">
          <div className="balatro-title-wrap">
            <BalatroLogo size={28} />
            <h1 className="balatro-title">Balatro</h1>
          </div>
          <p className="balatro-sub">
            The poker roguelike deckbuilder. Running Love.js WebAssembly locally in your browser with persistent saves.
          </p>

          <div className="balatro-actions">
            <button
              type="button"
              className="marker balatro-action-pill"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen Landscape"
            >
              <span>{isFullscreen ? 'Exit Fullscreen' : isPhone ? 'Play Fullscreen Landscape' : 'Fullscreen'}</span>
              <kbd className="balatro-kbd">{isPhone ? '⛶' : 'F'}</kbd>
            </button>

            <a
              href="/balatro/index.html"
              target="_blank"
              rel="noreferrer"
              className="marker balatro-action-pill"
              title="Open Launcher, Saves & Mods"
            >
              <span>Launcher & Saves</span>
              <Arrow dir="up-right" size={13} />
            </a>

            <a
              href="/balatro/play.html"
              target="_blank"
              rel="noreferrer"
              className="marker balatro-action-pill"
              title="Open direct play in new tab"
            >
              <span>New Tab</span>
              <Arrow dir="up-right" size={13} />
            </a>
          </div>
        </header>

        {/* Centered 16:9 Game Frame */}
        <div
          ref={containerRef}
          className={`balatro-game-wrap${isFullscreen ? ' is-fullscreen' : ''}`}
          onClick={isPhone && !isFullscreen ? toggleFullscreen : undefined}
        >
          <iframe
            src="/balatro/play.html"
            className="balatro-game-iframe"
            title="Balatro Web Port"
            allow="autoplay; fullscreen; gamepad"
          />
        </div>
      </div>
    </div>
  );
}
