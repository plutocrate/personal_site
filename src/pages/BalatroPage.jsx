import { useState, useRef, useEffect } from 'react';
import Crumbs from '../components/Crumbs.jsx';
import BalatroLogo from '../components/BalatroLogo.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { vibrate } from '../utils/haptics.js';

export default function BalatroPage() {
  const { showToast } = useToast();
  const [view, setView] = useState('game'); // 'game' | 'launcher'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    // Show polite welcoming toast
    showToast('play balatro');
  }, [showToast]);

  const toggleFullscreen = () => {
    vibrate(10);
    const elem = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleReload = () => {
    vibrate(8);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="balatro-page-wrap">
      {/* Breadcrumbs for desktop */}
      <div className="page-crumbs desktop-only-bar">
        <Crumbs trail={[{ label: 'About', to: '/' }, { label: 'Balatro' }]} />
      </div>

      <div className="balatro-page-container">
        {/* Top Control Bar */}
        <div className="balatro-top-bar">
          <div className="balatro-top-title-group">
            <div className="balatro-top-icon">
              <BalatroLogo size={28} />
            </div>
            <div>
              <h1 className="balatro-top-title">Balatro</h1>
              <span className="balatro-top-sub">WebAssembly Port · Runs 100% Offline</span>
            </div>
          </div>

          <div className="balatro-top-actions">
            {/* View Switcher: Game vs Launcher */}
            <div className="balatro-view-toggle">
              <button
                type="button"
                className={`balatro-action-btn${view === 'game' ? ' is-active' : ''}`}
                onClick={() => {
                  vibrate(8);
                  setView('game');
                }}
                title="Play Game"
              >
                ♠ Play
              </button>
              <button
                type="button"
                className={`balatro-action-btn${view === 'launcher' ? ' is-active' : ''}`}
                onClick={() => {
                  vibrate(8);
                  setView('launcher');
                }}
                title="Launcher, Saves & Mods"
              >
                ⚙ Launcher
              </button>
            </div>

            {/* Restart button */}
            <button
              type="button"
              className="balatro-action-btn"
              onClick={handleReload}
              title="Reload Game"
              aria-label="Reload Game"
            >
              ↻ Reload
            </button>

            {/* Fullscreen button */}
            <button
              type="button"
              className="balatro-action-btn balatro-action-btn-highlight"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen (F)"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
            </button>

            {/* Standalone Window link */}
            <a
              href={view === 'game' ? '/balatro/play.html' : '/balatro/index.html'}
              target="_blank"
              rel="noreferrer"
              className="balatro-action-btn"
              title="Open standalone page in new tab"
            >
              ↗ Open New Tab
            </a>
          </div>
        </div>

        {/* Game Frame Container */}
        <div
          ref={containerRef}
          className={`balatro-canvas-frame${isFullscreen ? ' is-fullscreen' : ''}`}
        >
          <iframe
            ref={iframeRef}
            src={view === 'game' ? '/balatro/play.html' : '/balatro/index.html'}
            className="balatro-iframe"
            title="Balatro Web Port"
            allow="autoplay; fullscreen; gamepad"
            tabIndex={0}
          />
        </div>

        {/* Bottom Helper Info */}
        <div className="balatro-footer-info">
          <p className="balatro-info-tip">
            <kbd>F</kbd> toggles fullscreen inside game · Saves persist automatically in browser IndexedDB · Single-player roguelike poker deckbuilder.
          </p>
        </div>
      </div>
    </div>
  );
}
